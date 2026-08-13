const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  banner: { type: String, required: true },
  discountPercentage: { type: Number, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  selectedProductIds: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);