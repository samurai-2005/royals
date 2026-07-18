const express = require('express');
const { protect, admin } = require('../middlewares/authMiddleware');
const { 
  getProducts, 
  getProductById, 
  getPromotionalProducts,
  createProduct,
  updateProduct // Newly imported controller
} = require('../controllers/productController');

const router = express.Router();

// Routes definitions
// Secured the POST route with protect and admin middlewares
router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/promotions/deals').get(getPromotionalProducts);

// Chained the new PUT method to the /:id route for editing
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct);

module.exports = router;