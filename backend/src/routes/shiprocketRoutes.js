const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { 
  checkServiceability, 
  createShiprocketOrder, 
  generateAWB, 
  generateLabel,
  trackShipment,
  cancelShiprocketOrder,
  createReturnOrder,
  shiprocketWebhook
} = require('../controllers/shiprocketController');

// Public route for Pincode serviceability checks
router.post('/serviceability', checkServiceability);

// Customer-facing Logistics Features
router.get('/track/:awb', protect, trackShipment);
router.post('/cancel-order', protect, cancelShiprocketOrder);
router.post('/create-return', protect, createReturnOrder);

// Authenticated / Admin Operations
router.post('/create-order', protect, createShiprocketOrder);
router.post('/generate-awb', protect, admin, generateAWB);
router.post('/generate-label', protect, admin, generateLabel);

// Webhook listener
router.post('/webhook', shiprocketWebhook);

module.exports = router;