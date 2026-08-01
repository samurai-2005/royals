const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');
const {
  getOrderConfirmationTemplate,
  getOrderStatusUpdateTemplate,
} = require('../utils/emailTemplates');

// @desc    Create new order
// @route   POST /api/orders
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    } else {
      const order = new Order({
        user: req.user._id, // Attached by authMiddleware
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();

      // Send confirmation email asynchronously
      if (req.user && req.user.email) {
        sendEmail({
          to: req.user.email,
          subject: `Order Confirmation #${createdOrder._id} - Royal Tailor`,
          html: getOrderConfirmationTemplate(createdOrder, req.user),
        });
      }

      res.status(201).json(createdOrder);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (ADMIN ONLY)
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (ADMIN ONLY)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      order.status = req.body.status || order.status;
      
      // If status is marked as Delivered, update timestamp and boolean
      if (req.body.status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();

      // Send email update to customer
      if (order.user && order.user.email) {
        sendEmail({
          to: order.user.email,
          subject: `Order Status Update: ${updatedOrder.status} - Royal Tailor`,
          html: getOrderStatusUpdateTemplate(updatedOrder, order.user),
        });
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrders,
  updateOrderStatus,
};