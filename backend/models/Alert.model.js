const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    savedSearch: { type: mongoose.Schema.Types.ObjectId, ref: 'SavedSearch' },
    reason: { type: String, maxlength: 300 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

alertSchema.index({ tenant: 1, listing: 1, savedSearch: 1 }, { unique: true });

module.exports = mongoose.model('Alert', alertSchema);
