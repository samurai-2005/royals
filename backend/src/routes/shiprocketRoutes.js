const express = require('express');
const router = express.Router(); // Fixed: changed from express.express.Router()
const { 
  checkServiceability, 
  createShiprocketOrder, 
  generateAWB, 
  generateLabel,
  shiprocketWebhook
} = require('../controllers/shiprocketController');

// Open route for frontend Pincode checking
router.post('/serviceability', checkServiceability);

// Logistics Operations
router.post('/create-order', createShiprocketOrder);
router.post('/generate-awb', generateAWB);
router.post('/generate-label', generateLabel);

// Webhook listener for Shiprocket servers
router.post('/webhook', shiprocketWebhook);

module.exports = router;