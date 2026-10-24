const { z } = require('zod');
const Listing = require('../models/Listing.model');
const Inquiry = require('../models/Inquiry.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const inquirySchema = z.object({
  message: z.string().trim().min(5, 'Say a little more than "hi"').max(500),
  moveIn: z.coerce.date().optional(),
});

const replySchema = z.object({ message: z.string().trim().min(1, 'Write a reply').max(500) });

exports.send = asyncHandler(async (req, res) => {
  if (req.user.role !== 'tenant') throw new AppError(403, 'Tenants send inquiries');
  const parsed = inquirySchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new AppError(404, 'Listing not found');
  if (listing.status !== 'available') throw new AppError(409, 'That listing is already rented');
  if (String(listing.owner) === String(req.user.id)) throw new AppError(400, 'That is your own listing');

  const dupe = await Inquiry.findOne({ listing: listing._id, tenant: req.user.id, status: 'open' });
  if (dupe) throw new AppError(409, 'You already have an open inquiry on this listing');

  const inquiry = await Inquiry.create({
    listing: listing._id,
    tenant: req.user.id,
    message: parsed.data.message,
    moveIn: parsed.data.moveIn,
  });
  res.status(201).json(inquiry);
});

exports.thread = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id).populate('listing', 'title rent area status').populate('tenant', 'name phone');
  if (!inquiry) throw new AppError(404, 'Inquiry not found');
  const isOwner = String(inquiry.listing.owner) === String(req.user.id);
  const isTenant = String(inquiry.tenant._id) === String(req.user.id);
  if (!isOwner && !isTenant) throw new AppError(403, 'Not your conversation');
  res.json({ ...inquiry.toObject(), viewer: isOwner ? 'owner' : 'tenant' });
});

exports.reply = asyncHandler(async (req, res) => {
  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const inquiry = await Inquiry.findById(req.params.id).populate('listing', 'owner');
  if (!inquiry) throw new AppError(404, 'Inquiry not found');
  const isOwner = String(inquiry.listing.owner) === String(req.user.id);
  const isTenant = String(inquiry.tenant) === String(req.user.id);
  if (!isOwner && !isTenant) throw new AppError(403, 'Not your conversation');
  inquiry.replies.push({ by: req.user.id, byName: req.user.name, message: parsed.data.message });
  await inquiry.save();
  res.json(inquiry);
});

exports.mine = asyncHandler(async (req, res) => {
  if (req.user.role !== 'tenant') throw new AppError(403, 'Tenants only');
  const inquiries = await Inquiry.find({ tenant: req.user.id })
    .populate('listing', 'title rent area status')
    .sort('-createdAt');
  res.json(inquiries);
});
