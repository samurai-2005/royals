const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User'); 
const sendEmail = require('../utils/sendEmail');
const webpush = require('web-push');
const {
  getOrderConfirmationTemplate,
  getOrderStatusUpdateTemplate,
} = require('../utils/emailTemplates');

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

    // 🔒 1. MANDATORY PHONE VERIFICATION GUARD
    const user = await User.findById(req.user._id);

    if (!user || !user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number verification required. Please verify your phone number with an OTP before placing an order.',
      });
    }

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ message: 'No order items provided.' });
      return;
    }

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

    const order = new Order({
      user: req.user._id, 
      orderItems,
      shippingAddress: {
        ...shippingAddress,
        phone: user.phone || shippingAddress.phone // Attaches verified mobile number
      },
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    for (const item of orderItems) {
      const productId = item.product || item._id;
      const product = await Product.findById(productId);

      if (product) {
        product.countInStock = Math.max(0, product.countInStock - item.qty);
        product.inStock = product.countInStock > 0;
        await product.save();
      }
    }

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
      
      if (req.body.status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();

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

        if (userToNotify.pushSubscription && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
          try {
            webpush.setVapidDetails(
              'mailto:support@royaltailors.net', 
              process.env.VAPID_PUBLIC_KEY,
              process.env.VAPID_PRIVATE_KEY
            );

            await webpush.sendNotification(
              userToNotify.pushSubscription,
              JSON.stringify({
                title: notificationPayload.title,
                body: notificationPayload.message,
                url: 'https://royaltailors.net/orders' 
              })
            );
            console.log('✅ Web Push Sent Successfully to device.');
          } catch (pushErr) {
            console.warn('⚠️ Web Push Failed:', pushErr.message);
          }
        }
      }

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