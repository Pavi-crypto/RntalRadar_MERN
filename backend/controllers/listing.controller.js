const { z } = require('zod');
const Listing = require('../models/Listing.model');
const Inquiry = require('../models/Inquiry.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { haversineKm } = require('../utils/geo');

const AMENITIES = ['parking', 'lift', 'furnished', 'ac', 'gated', 'power backup', 'balcony', 'pets ok'];

const listingSchema = z.object({
  title: z.string().trim().min(4, 'Give the listing a title').max(120),
  type: z.enum(['1RK', '1BHK', '2BHK', '3BHK', 'PG']),
  rent: z.coerce.number().min(1000, 'Rent must be at least ₹1000'),
  deposit: z.coerce.number().min(0),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  address: z.string().trim().min(4, 'Add the address').max(200),
  area: z.string().trim().max(80).optional(),
  amenities: z.array(z.enum(AMENITIES)).max(8).default([]),
});

async function requireListing(id, userId) {
  const listing = await Listing.findById(id);
  if (!listing) throw new AppError(404, 'Listing not found');
  if (String(listing.owner) !== String(userId)) throw new AppError(403, 'Not your listing');
  return listing;
}

exports.amenities = asyncHandler(async (_req, res) => res.json(AMENITIES));

// Geo search: radius around a center point via haversine, plus filters.
exports.search = asyncHandler(async (req, res) => {
  const { lat, lng, radiusKm, minRent, maxRent, type, amenity, sort } = req.query;
  const filter = { status: 'available' };
  if (type) filter.type = type;
  if (minRent || maxRent) {
    filter.rent = {};
    if (minRent) filter.rent.$gte = Number(minRent);
    if (maxRent) filter.rent.$lte = Number(maxRent);
  }
  if (amenity) filter.amenities = amenity;

  let listings = await Listing.find(filter).populate('owner', 'name phone');

  if (lat !== undefined && lng !== undefined && radiusKm !== undefined) {
    const center = { lat: Number(lat), lng: Number(lng) };
    const r = Number(radiusKm) || 5;
    listings = listings
      .map((l) => ({ ...l.toObject(), distanceKm: haversineKm(center.lat, center.lng, l.lat, l.lng) }))
      .filter((l) => l.distanceKm <= r);
    if (sort === 'rent') listings.sort((a, b) => a.rent - b.rent);
    else listings.sort((a, b) => a.distanceKm - b.distanceKm); // default: nearest
  } else if (sort === 'rent') {
    listings.sort((a, b) => a.rent - b.rent);
  } else {
    listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json(listings.slice(0, 60));
});

exports.create = asyncHandler(async (req, res) => {
  if (req.user.role !== 'owner') throw new AppError(403, 'Only owners list properties');
  const parsed = listingSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const listing = await Listing.create({
    ...parsed.data,
    owner: req.user.id,
    priceHistory: [{ at: new Date(), rent: parsed.data.rent }],
  });
  res.status(201).json(listing);
});

exports.getOne = asyncHandler(async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('owner', 'name phone role');
  if (!listing) throw new AppError(404, 'Listing not found');
  const inquiryCount = await Inquiry.countDocuments({ listing: listing._id });
  res.json({ ...listing.toObject(), inquiryCount });
});

exports.update = asyncHandler(async (req, res) => {
  const parsed = listingSchema.partial().safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const listing = await requireListing(req.params.id, req.user.id);
  const oldRent = listing.rent;
  Object.assign(listing, parsed.data);
  if (parsed.data.rent && parsed.data.rent !== oldRent) {
    listing.priceHistory.push({ at: new Date(), rent: parsed.data.rent });
  }
  await listing.save();
  res.json(listing);
});

exports.markRented = asyncHandler(async (req, res) => {
  const listing = await requireListing(req.params.id, req.user.id);
  listing.status = listing.status === 'rented' ? 'available' : 'rented';
  await listing.save();
  res.json(listing);
});

exports.remove = asyncHandler(async (req, res) => {
  const listing = await requireListing(req.params.id, req.user.id);
  await Inquiry.deleteMany({ listing: listing._id });
  await listing.deleteOne();
  res.json({ deleted: true });
});

exports.ownerDashboard = asyncHandler(async (req, res) => {
  if (req.user.role !== 'owner') throw new AppError(403, 'Owners only');
  const listings = await Listing.find({ owner: req.user.id }).sort('-createdAt');
  const withInquiries = await Promise.all(
    listings.map(async (l) => ({
      ...l.toObject(),
      inquiries: await Inquiry.countDocuments({ listing: l._id }),
    }))
  );
  res.json({
    listings: withInquiries,
    totals: {
      views: listings.reduce((s, l) => s + l.views, 0),
      inquiries: withInquiries.reduce((s, l) => s + l.inquiries, 0),
      available: listings.filter((l) => l.status === 'available').length,
    },
  });
});
