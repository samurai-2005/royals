const Product = require('../models/Product');

// @desc    Get all products or filter by mainGroup/subGroup
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { mainGroup, subGroup } = req.query;
    let query = {};
    
    // Case-insensitive filtering for the parent organization
    if (mainGroup) {
      query.mainGroup = { $regex: new RegExp(`^${mainGroup}$`, 'i') }; 
    }
    
    // Case-insensitive filtering for the specific clothing type (for future use)
    if (subGroup) {
      query.subGroup = { $regex: new RegExp(`^${subGroup}$`, 'i') };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single product by ID (Myntra-style detail page)
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get promotional / discounted products for the Right Sidebar
// @route   GET /api/products/promotions/deals
const getPromotionalProducts = async (req, res) => {
  try {
    // Only fetch promotional items that are actually in stock
    const deals = await Product.find({ isPromotional: true, inStock: true });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new product (Admin Upload Mechanism)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      mainGroup, 
      subGroup, 
      images, 
      isPromotional, 
      discountPrice 
    } = req.body;

    // Validate that the required mainGroup is provided
    if (!mainGroup) {
      return res.status(400).json({ message: 'mainGroup (e.g., NCC, Bihar Police) is required.' });
    }

    const product = new Product({
      name,
      description,
      price,
      mainGroup,
      subGroup: subGroup || 'Unassigned', // Graceful fallback for your current data
      images: images || [],
      isPromotional: isPromotional || false,
      discountPrice: discountPrice || 0
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product (Admin Edit Mechanism)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, images, mainGroup, subGroup } = req.body;
    
    // Find the product by the ID passed in the URL
    const product = await Product.findById(req.params.id);

    if (product) {
      // Update fields with new data from the frontend form
      product.name = name;
      product.price = price;
      product.description = description;
      product.images = images; 
      product.mainGroup = mainGroup;
      product.subGroup = subGroup;

      // Save the updated document back to the database
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getPromotionalProducts,
  createProduct,
  updateProduct 
};