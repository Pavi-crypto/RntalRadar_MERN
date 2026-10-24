const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    type: { type: String, enum: ['1RK', '1BHK', '2BHK', '3BHK', 'PG'], required: true },
    rent: { type: Number, required: true, min: 1000 },
    deposit: { type: Number, required: true, min: 0 },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    address: { type: String, required: true, trim: true, maxlength: 200 },
    area: { type: String, trim: true, maxlength: 80 },
    amenities: [{ type: String, trim: true }],
    photos: [{ type: String }],
    status: { type: String, enum: ['available', 'rented'], default: 'available', index: true },
    views: { type: Number, default: 0 },
    priceHistory: [
      { at: { type: Date, default: Date.now }, rent: { type: Number } , _id: false },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);
