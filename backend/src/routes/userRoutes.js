const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  authUser,
  registerUser,
  checkOtpChannels,
  sendOtp,
  verifyOtp,
  getUserProfile,
  updateUserProfile,
  savePushSubscription,
} = require('../controllers/userController');

// Registration & Login Routes
router.post('/register', registerUser); // Matches POST /api/users/register from frontend
router.post('/', registerUser);         // Backup for POST /api/users
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