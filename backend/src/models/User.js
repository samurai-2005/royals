const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define individual notification structure
const notificationSchema = new mongoose.Schema({
  type: { type: String, default: 'general' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetUrl: { type: String },
  read: { type: Boolean, default: false },
  isExpired: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, unique: true, sparse: true }, 
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    isAdmin: { type: Boolean, default: false },
    profilePicture: { type: String, default: '' },
    
    // Verification Flags
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    
    // OTP Storage & Expirations
    otp: { type: String },
    otpExpires: { type: Date },
    
    googleId: { type: String },

    // LIVE NOTIFICATIONS & PUSH SUBSCRIPTION
    pushSubscription: { type: Object, default: null },
    notifications: [notificationSchema]
  },
  { timestamps: true }
);

// Match entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);