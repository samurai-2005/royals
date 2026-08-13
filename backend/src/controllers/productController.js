const Product = require('../models/Product');
const sendPushNotification = require('../utils/pushNotification');

// Helper: Converts slugs like "school-uniforms" to flexible regex matching "School Uniforms"
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

    if (category || type) {
      const catRegex = createFlexibleRegex(category || type);
      query.$or = [
        { mainGroup: catRegex },
        { subGroup: catRegex }
      ];
    } else {
      if (mainGroup) query.mainGroup = createFlexibleRegex(mainGroup);
      if (subGroup) query.subGroup = createFlexibleRegex(subGroup);
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

// @desc    Create a new product or uniform set
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
      discountPercentage,
      countInStock,
      weight,
      length,
      width,
      height,
      selectedComponents
    } = req.body;

    if (!mainGroup) {
      return res.status(400).json({ message: 'mainGroup is required.' });
    }

    const stockCount = countInStock !== undefined ? Number(countInStock) : 10;

    const product = new Product({
      name,
      description,
      price,
      mainGroup,
      subGroup: subGroup || 'Unassigned', 
      images: images || [],
      selectedComponents: selectedComponents || [],
      isPromotional: isPromotional || false,
      discountPrice: discountPrice || 0,
      discountPercentage: discountPercentage || 0,
      countInStock: stockCount,
      inStock: stockCount > 0,
      weight: Number(weight) || 0.5,
      length: Number(length) || 10,
      width: Number(width) || 10,
      height: Number(height) || 5
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product or set details
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { 
      name, 
      price, 
      description, 
      images, 
      mainGroup, 
      subGroup, 
      discountPrice, 
      discountPercentage, 
      countInStock,
      weight,
      length,
      width,
      height,
      selectedComponents
    } = req.body;
    
    const product = await Product.findById(req.params.id);

    if (product) {
      const wasOutOfStock = product.countInStock <= 0 || !product.inStock;

      product.name = name || product.name;
      product.price = price !== undefined ? price : product.price;
      product.description = description || product.description;
      product.images = images || product.images; 
      product.mainGroup = mainGroup || product.mainGroup;
      product.subGroup = subGroup || product.subGroup;
      
      if (selectedComponents !== undefined) product.selectedComponents = selectedComponents;
      if (discountPrice !== undefined) product.discountPrice = discountPrice;
      if (discountPercentage !== undefined) product.discountPercentage = discountPercentage;

      if (countInStock !== undefined) {
        product.countInStock = Number(countInStock);
        product.inStock = product.countInStock > 0;
      }

      if (weight !== undefined) product.weight = Number(weight);
      if (length !== undefined) product.length = Number(length);
      if (width !== undefined) product.width = Number(width);
      if (height !== undefined) product.height = Number(height);

      const isNowInStock = product.countInStock > 0;

      // 🔔 TRIGGER RESTOCK PUSH NOTIFICATION IF STOCK WAS RESTOCKED FROM 0
      if (wasOutOfStock && isNowInStock && product.restockSubscribers?.length > 0) {
        const payload = {
          title: `Item Restocked! 🎉`,
          body: `Good news! "${product.name}" is back in stock. Order now before it runs out.`,
          url: `/product/${product._id}`
        };

        for (const subscriber of product.restockSubscribers) {
          if (subscriber.subscription) {
            await sendPushNotification(subscriber.subscription, payload);
          }
        }

        product.restockSubscribers = [];
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Subscribe user to "Notify Me" restock waitlist
// @route   POST /api/products/:id/notify-me
const subscribeToRestock = async (req, res) => {
  try {
    const { subscription, email } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.countInStock > 0) {
      return res.status(400).json({ message: 'Product is currently in stock.' });
    }

    const alreadySubscribed = product.restockSubscribers.some(
      (sub) => sub.subscription?.endpoint === subscription?.endpoint || (email && sub.email === email)
    );

    if (!alreadySubscribed) {
      product.restockSubscribers.push({
        user: req.user?._id || null,
        email: email || req.user?.email || null,
        subscription
      });
      await product.save();
    }

    res.status(200).json({ message: 'Successfully subscribed to restock notifications!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
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
  subscribeToRestock,
  deleteProduct,
  createProductReview
};