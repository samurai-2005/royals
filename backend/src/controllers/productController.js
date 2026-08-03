const Product = require('../models/Product');

// Helper: Converts slugs like "school-uniforms" or "security_guard" to flexible regex matching "School Uniforms"
const createFlexibleRegex = (paramStr) => {
  if (!paramStr) return null;
  const sanitized = paramStr.trim().replace(/[-_]/g, '[\\s\\-_]+');
  return new RegExp(`^${sanitized}$`, 'i');
};

// @desc    Get all products or filter by mainGroup/subGroup/category
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { mainGroup, subGroup, category, type } = req.query;
    let query = {};

    // 1. If frontend passes a generic 'category' or 'type' query (e.g. ?category=school-uniforms)
    if (category || type) {
      const catRegex = createFlexibleRegex(category || type);
      query.$or = [
        { mainGroup: catRegex },
        { subGroup: catRegex }
      ];
    } else {
      // 2. Specific mainGroup and/or subGroup queries
      if (mainGroup) {
        query.mainGroup = createFlexibleRegex(mainGroup);
      }
      
      if (subGroup) {
        query.subGroup = createFlexibleRegex(subGroup);
      }
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single product by ID 
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

// @desc    Get promotional / discounted products
// @route   GET /api/products/promotions/deals
const getPromotionalProducts = async (req, res) => {
  try {
    const deals = await Product.find({ isPromotional: true, inStock: true });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new product 
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
      discountPrice,
      discountPercentage 
    } = req.body;

    if (!mainGroup) {
      return res.status(400).json({ message: 'mainGroup is required.' });
    }

    const product = new Product({
      name,
      description,
      price,
      mainGroup,
      subGroup: subGroup || 'Unassigned', 
      images: images || [],
      isPromotional: isPromotional || false,
      discountPrice: discountPrice || 0,
      discountPercentage: discountPercentage || 0
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product 
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { 
      name, price, description, images, mainGroup, subGroup, discountPrice, discountPercentage 
    } = req.body;
    
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.images = images || product.images; 
      product.mainGroup = mainGroup || product.mainGroup;
      product.subGroup = subGroup || product.subGroup;
      
      if (discountPrice !== undefined) product.discountPrice = discountPrice;
      if (discountPercentage !== undefined) product.discountPercentage = discountPercentage;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product review
// @route   POST /api/products/:id/reviews
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'You have already reviewed this product' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added successfully' });
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
  updateProduct,
  deleteProduct,
  createProductReview
};