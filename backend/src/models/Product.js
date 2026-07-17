const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }], // Optional for now, in case you don't have URLs yet
  
  // The Hierarchical Categorization
  mainGroup: { 
    type: String, 
    required: true, // e.g., 'NCC', 'Bihar Police', 'Indian Army'
    trim: true
  },
  subGroup: { 
    type: String, 
    default: 'Unassigned', // Defaults to Unassigned so you can categorize later
    trim: true 
  },
  
  isPromotional: { type: Boolean, default: false },
  discountPrice: { type: Number },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);