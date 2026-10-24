const Listing = require('../models/Listing.model');
const asyncHandler = require('../utils/asyncHandler');
const { haversineKm } = require('../utils/geo');

// Price intelligence: average/median rent per area + per type.
exports.priceIntelligence = asyncHandler(async (_req, res) => {
  const listings = await Listing.find().select('rent type area');
  const byArea = {};
  for (const l of listings) {
    const key = l.area || 'other';
    (byArea[key] ||= []).push(l.rent);
  }
  const areas = Object.entries(byArea).map(([area, rents]) => {
    const sorted = [...rents].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    return {
      area,
      count: rents.length,
      avgRent: Math.round(rents.reduce((s, r) => s + r, 0) / rents.length),
      medianRent: median,
      minRent: sorted[0],
    };
  }).sort((a, b) => b.count - a.count);
  res.json({ areas });
});

// Comparables: similar listings within 2km, same type, ±25% rent.
exports.similar = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new AppError(404, 'Listing not found');
  const candidates = await Listing.find({ _id: { $ne: listing._id }, status: 'available' });
  const comps = candidates
    .map((c) => ({ listing: c, distance: haversineKm(listing.lat, listing.lng, c.lat, c.lng) }))
    .filter((x) => x.distance <= 2 && x.listing.type === listing.type && x.listing.rent >= listing.rent * 0.75 && x.listing.rent <= listing.rent * 1.25)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
    .map((x) => ({ ...x.listing.toObject(), distanceKm: x.distance }));
  res.json(comps);
});
