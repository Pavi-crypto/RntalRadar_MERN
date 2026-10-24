const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    filters: {
      lat: { type: Number },
      lng: { type: Number },
      radiusKm: { type: Number, min: 0.5, max: 50 },
      minRent: { type: Number },
      maxRent: { type: Number },
      type: { type: String, enum: ['1RK', '1BHK', '2BHK', '3BHK', 'PG'] },
      amenities: [{ type: String }],
    },
    lastRunAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
