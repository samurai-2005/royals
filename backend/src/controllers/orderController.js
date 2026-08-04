const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User'); // Required to save in-app notifications
const sendEmail = require('../utils/sendEmail');
const webpush = require('web-push');
const {
  getOrderConfirmationTemplate,
  getOrderStatusUpdateTemplate,
} = require('../utils/emailTemplates');

// Configure Web Push with your VAPID Keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@royaltailors.net', // Change to your actual support email
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// @desc    Create new order & automatically deduct stock inventory
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

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ message: 'No order items provided.' });
      return;
    }

    // 1. Verify stock availability for all requested items
    for (const item of orderItems) {
      const productId = item.product || item._id;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: `Product "${item.name}" not found.` });
      }

      if (product.countInStock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Only ${product.countInStock} item(s) available.`
        });
      }
    }

    // 2. Create and save the order
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

    // 3. Deduct inventory count for each purchased item
    for (const item of orderItems) {
      const productId = item.product || item._id;
      const product = await Product.findById(productId);

      if (product) {
        product.countInStock = Math.max(0, product.countInStock - item.qty);
        product.inStock = product.countInStock > 0;
        await product.save();
      }
    }

    // Send confirmation email asynchronously
    if (req.user && req.user.email) {
      sendEmail({
        to: req.user.email,
        subject: `Order Confirmation #${createdOrder._id} - Royal Tailor`,
        html: getOrderConfirmationTemplate(createdOrder, req.user),
      });
    }

    res.status(201).json(createdOrder);
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

// @desc    Update order status (ADMIN ONLY) + Trigger In-App Notification and Web Push
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

      // 🔔 1. Save In-App Notification to User Database
      const userToNotify = await User.findById(order.user._id);
      if (userToNotify) {
        const notificationPayload = {
          type: 'order',
          title: `Order ${updatedOrder.status}! 🚚`,
          message: `Your order #${updatedOrder._id.toString().slice(-6).toUpperCase()} has been marked as ${updatedOrder.status}.`,
          targetUrl: '/orders',
        };
        
        userToNotify.notifications.unshift(notificationPayload);
        await userToNotify.save();

        // 📱 2. Trigger PWA Web Push to Phone (If user subscribed)
        if (userToNotify.pushSubscription && process.env.VAPID_PUBLIC_KEY) {
          try {
            await webpush.sendNotification(
              userToNotify.pushSubscription,
              JSON.stringify({
                title: notificationPayload.title,
                body: notificationPayload.message,
                url: 'https://royaltailors.net/orders' // Modify domain for prod
              })
            );
          } catch (pushErr) {
            console.warn('Web Push Failed (User might have revoked permission or token expired):', pushErr.message);
          }
        }
      }

      // 📧 3. Send traditional email update to customer
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