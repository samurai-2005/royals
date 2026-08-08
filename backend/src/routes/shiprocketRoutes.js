const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { 
  checkServiceability, 
  createShiprocketOrder, 
  generateAWB, 
  generateLabel,
  shiprocketWebhook
} = require('../controllers/shiprocketController');

// Public route for Pincode serviceability checks on frontend
router.post('/serviceability', checkServiceability);

// Authenticated / Admin Logistics Operations
router.post('/create-order', protect, createShiprocketOrder);
router.post('/generate-awb', protect, admin, generateAWB);
router.post('/generate-label', protect, admin, generateLabel);

// Webhook listener for automatic tracking status updates from Shiprocket
router.post('/webhook', shiprocketWebhook);

module.exports = router;