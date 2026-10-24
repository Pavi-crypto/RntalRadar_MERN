const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    moveIn: { type: Date },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    replies: [
      {
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        byName: { type: String },
        message: { type: String, required: true, maxlength: 500 },
        at: { type: Date, default: Date.now },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
