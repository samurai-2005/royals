const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  authUser,
  registerUser,
  checkOtpChannels,
  sendOtp,
  verifyOtp,
  getUserProfile,
  updateUserProfile,
  savePushSubscription,
  getUsers,
} = require('../controllers/userController');

// Registration, Login & Admin Directory Routes
router.post('/register', registerUser); // Matches POST /api/users/register from frontend
router.route('/')
  .post(registerUser)         // Backup for POST /api/users
  .get(protect, admin, getUsers); // Admin access to fetch all users
router.post('/login', authUser);

// OTP Verification Routes
router.post('/check-otp-channels', checkOtpChannels);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// PWA Push Subscription Route
router.post('/subscribe-push', savePushSubscription);

// Protected Profile Route
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;