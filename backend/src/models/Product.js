const mongoose = require('mongoose');

// Define a separate schema for individual reviews
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// Schema for Restock Subscribers ("Notify Me" Waitlist)
const restockSubscriberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String },
    subscription: { type: Object }, // Web Push Subscription Payload
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  discountPrice: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  
  mainGroup: { 
    type: String, 
    required: true, 
    trim: true
  },
  subGroup: { 
    type: String, 
    default: 'Unassigned', 
    trim: true 
  },
  
  isPromotional: { type: Boolean, default: false },

  // INVENTORY MANAGEMENT
  countInStock: {
    type: Number,
    required: true,
    default: 10,
    min: 0,
  },
  inStock: { 
    type: Boolean, 
    default: true 
  },

  // "NOTIFY ME" WAITLIST SUBSCRIBERS
  restockSubscribers: [restockSubscriberSchema],

  // REVIEWS & RATINGS
  reviews: [reviewSchema],
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);