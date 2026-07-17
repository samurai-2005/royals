const express = require('express');
const { protect, admin } = require('../middlewares/authMiddleware');
const { 
  getProducts, 
  getProductById, 
  getPromotionalProducts,
  createProduct 
} = require('../controllers/productController');

const router = express.Router();

// Routes definitions
router.route('/').get(getProducts).post(createProduct);
router.route('/promotions/deals').get(getPromotionalProducts);
router.route('/:id').get(getProductById);

module.exports = router;