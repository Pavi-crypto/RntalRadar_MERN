const { z } = require('zod');
const SavedSearch = require('../models/SavedSearch.model');
const Alert = require('../models/Alert.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const searchSchema = z.object({
  name: z.string().trim().min(2, 'Name your search').max(80),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(0.5).max(50).optional(),
  minRent: z.coerce.number().min(0).optional(),
  maxRent: z.coerce.number().min(0).optional(),
  type: z.enum(['1RK', '1BHK', '2BHK', '3BHK', 'PG']).optional(),
  amenities: z.array(z.string()).max(8).optional(),
});

exports.save = asyncHandler(async (req, res) => {
  if (req.user.role !== 'tenant') throw new AppError(403, 'Tenants save searches');
  const parsed = searchSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const { name, lat, lng, radiusKm, minRent, maxRent, type, amenities } = parsed.data;
  const search = await SavedSearch.create({ tenant: req.user.id, name, filters: { lat, lng, radiusKm, minRent, maxRent, type, amenities } });
  res.status(201).json(search);
});

exports.listMine = asyncHandler(async (req, res) => {
  const searches = await SavedSearch.find({ tenant: req.user.id }).sort('-createdAt');
  const Alert = require('../models/Alert.model');
  const withNew = await Promise.all(
    searches.map(async (s) => ({
      ...s.toObject(),
      newMatches: await Alert.countDocuments({ savedSearch: s._id, read: false }),
    }))
  );
  res.json(withNew);
});

exports.remove = asyncHandler(async (req, res) => {
  const search = await SavedSearch.findOne({ _id: req.params.id, tenant: req.user.id });
  if (!search) throw new AppError(404, 'Saved search not found');
  await Alert.deleteMany({ savedSearch: search._id });
  await search.deleteOne();
  res.json({ deleted: true });
});

exports.alerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ tenant: req.user.id })
    .populate('listing', 'title rent type area address')
    .sort('-createdAt')
    .limit(50);
  res.json(alerts);
});

exports.markRead = asyncHandler(async (req, res) => {
  await Alert.updateMany({ tenant: req.user.id, read: false }, { read: true });
  res.json({ ok: true });
});
