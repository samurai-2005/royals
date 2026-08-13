const Sale = require('../models/Sale');

// @desc    Get all active sale events
// @route   GET /api/sales
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({}).sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new flash sale event
// @route   POST /api/sales
// @access  Private/Admin
const createSale = async (req, res) => {
  try {
    const { title, banner, discountPercentage, startDate, endDate, selectedProductIds } = req.body;

    const sale = new Sale({
      title,
      banner,
      discountPercentage,
      startDate,
      endDate,
      selectedProductIds: selectedProductIds || [],
      isActive: true
    });

    const createdSale = await sale.save();
    res.status(201).json(createdSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a sale event permanently
// @route   DELETE /api/sales/:id
// @access  Private/Admin
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (sale) {
      await sale.deleteOne();
      res.json({ message: 'Sale event deleted permanently' });
    } else {
      res.status(404).json({ message: 'Sale event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSales, createSale, deleteSale };