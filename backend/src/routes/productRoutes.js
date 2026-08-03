const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  getProducts,
  getProductById,
  getPromotionalProducts,
  createProduct,
  updateProduct,
  subscribeToRestock,
  deleteProduct,
  createProductReview,
} = require('../controllers/productController');

// 1. Root Product Routes (Fetch Catalog / Admin Create)
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// 2. Flash Sales & Promotional Deals (Placed BEFORE /:id to avoid route collision)
router.get('/promotions/deals', getPromotionalProducts);

// 3. Product-Specific Routes (Fetch / Update / Delete by ID)
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// 4. Product Reviews
router.post('/:id/reviews', protect, createProductReview);

// 5. "Notify Me" Restock Waitlist Subscription
router.post('/:id/notify-me', subscribeToRestock);

module.exports = router;