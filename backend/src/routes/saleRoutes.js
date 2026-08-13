const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { getSales, createSale, deleteSale } = require('../controllers/saleController');

router.route('/')
  .get(getSales)
  .post(protect, admin, createSale);

router.route('/:id')
  .delete(protect, admin, deleteSale);

module.exports = router;