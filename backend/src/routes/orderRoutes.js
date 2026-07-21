const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  addOrderItems,
  getMyOrders,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

// Standard user route to create an order, and Admin route to get all orders
router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);

// User route to fetch their personal order history
router.route('/myorders').get(protect, getMyOrders);

// Admin route to change order status (e.g., from Processing to Out for Delivery)
router.route('/:id/status').put(protect, admin, updateOrderStatus);

module.exports = router;