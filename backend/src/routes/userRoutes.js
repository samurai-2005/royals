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
} = require('../controllers/userController');

// Standard Authentication Routes
router.post('/', registerUser);
router.post('/login', authUser);

// OTP Verification Routes
router.post('/check-otp-channels', checkOtpChannels);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Protected Profile Route
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;