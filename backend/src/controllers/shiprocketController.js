const axios = require('axios');
const mongoose = require('mongoose');
const Order = require('../models/Order');

let cachedToken = null;
let tokenExpiry = null;

// Helper: Authenticate with Live Shiprocket API
const getShiprocketToken = async () => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const { data } = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });

    cachedToken = data.token;
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; 
    console.log('✅ Shiprocket Authenticated Successfully');
    return cachedToken;
  } catch (error) {
    console.error('Shiprocket Auth Error:', error.response?.data || error.message);
    throw new Error('Logistics authentication failed. Check credentials in .env');
  }
};

// 1. DYNAMIC SHIPPING RATES & PINCODE CHECK
const checkServiceability = async (req, res) => {
  const { delivery_postcode, weight = 0.5, cod = 1 } = req.body;

  if (!delivery_postcode) {
    return res.status(400).json({ success: false, message: 'Delivery pincode is required.' });
  }

  try {
    const token = await getShiprocketToken();

    const { data } = await axios.get('https://apiv2.shiprocket.in/v1/external/courier/serviceability', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        pickup_postcode: 801503, // Danapur Cantt, Patna Warehouse PIN
        delivery_postcode,
        weight,
        cod: cod ? 1 : 0
      }
    });

    res.json({ success: true, data: data.data });
  } catch (error) {
    console.error('Serviceability Check Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || 'Failed to check shipping serviceability.' 
    });
  }
};

// 2. AUTOMATED LIVE ORDER CREATION
const createShiprocketOrder = async (req, res) => {
  const { orderId, orderItems, shippingAddress, totalPrice, user, paymentMethod } = req.body;

  try {
    const token = await getShiprocketToken();

    const fullName = user?.name || shippingAddress?.name || 'Valued Customer';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '';

    const payload = {
      order_id: String(orderId).substring(0, 20),
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION_ID || 'warehouse',
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: shippingAddress?.address || '',
      billing_city: shippingAddress?.city || 'Patna',
      billing_pincode: shippingAddress?.postalCode || '',
      billing_state: shippingAddress?.state || 'Bihar',
      billing_country: shippingAddress?.country || 'India',
      billing_email: user?.email || 'customer@royaltailors.net',
      billing_phone: shippingAddress?.phone || user?.phone || '9999999999',
      shipping_is_billing: true,
      order_items: (orderItems || []).map((item) => ({
        name: item.name,
        sku: String(item.product || item._id).substring(0, 10),
        units: item.qty || 1,
        selling_price: item.price
      })),
      payment_method: paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      sub_total: totalPrice,
      length: 10,
      breadth: 10,
      height: 5,
      weight: 0.5
    };

    const { data } = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (orderId && data.order_id) {
      await Order.findByIdAndUpdate(orderId, {
        shiprocketOrderId: data.order_id,
        shipmentId: data.shipment_id
      });
    }

    res.json({
      success: true,
      shiprocket_order_id: data.order_id,
      shipment_id: data.shipment_id,
      data
    });
  } catch (error) {
    console.error('Shiprocket Create Order Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order in Shiprocket.',
      details: error.response?.data 
    });
  }
};

// 3. AUTOMATED COURIER ASSIGNMENT (Generate AWB)
const generateAWB = async (req, res) => {
  const { shipment_id, courier_id } = req.body;

  if (!shipment_id) {
    return res.status(400).json({ success: false, message: 'shipment_id is required.' });
  }

  try {
    const token = await getShiprocketToken();

    const payload = { shipment_id };
    if (courier_id) payload.courier_id = courier_id;

    const { data } = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({ 
      success: true, 
      response: data.response?.data || data 
    });
  } catch (error) {
    console.error('Shiprocket AWB Generation Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate AWB code.',
      details: error.response?.data 
    });
  }
};

// 4. LABEL GENERATION
const generateLabel = async (req, res) => {
  const { shipment_id } = req.body;

  if (!shipment_id) {
    return res.status(400).json({ success: false, message: 'shipment_id is required.' });
  }

  try {
    const token = await getShiprocketToken();
    const shipmentIds = Array.isArray(shipment_id) ? shipment_id : [shipment_id];

    const { data } = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/courier/generate/label',
      { shipment_id: shipmentIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({ 
      success: true, 
      label_url: data.label_url,
      data 
    });
  } catch (error) {
    console.error('Shiprocket Label Generation Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate shipping label.',
      details: error.response?.data 
    });
  }
};

// 5. REAL-TIME TRACKING VIA AWB
const trackShipment = async (req, res) => {
  const { awb } = req.params;

  try {
    const token = await getShiprocketToken();
    const { data } = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json({ success: true, tracking: data });
  } catch (error) {
    console.error('Shiprocket Tracking Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve tracking information.' });
  }
};

// 6. CANCELLATION API
const cancelShiprocketOrder = async (req, res) => {
  const { mongoOrderId, shiprocketOrderId } = req.body;

  try {
    const token = await getShiprocketToken();

    if (shiprocketOrderId) {
      await axios.post(
        'https://apiv2.shiprocket.in/v1/external/orders/cancel',
        { ids: [shiprocketOrderId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    await Order.findByIdAndUpdate(mongoOrderId, { status: 'Cancelled' });

    res.json({ success: true, message: 'Order cancelled successfully.' });
  } catch (error) {
    console.error('Shiprocket Cancel Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to cancel order in Shiprocket.' });
  }
};

// 7. RETURN / EXCHANGE API
const createReturnOrder = async (req, res) => {
  const { orderId, orderItems, shippingAddress, user } = req.body;

  try {
    const token = await getShiprocketToken();

    const payload = {
      order_id: `RET_${String(orderId).substring(0, 16)}`,
      order_date: new Date().toISOString().split('T')[0],
      pickup_customer_name: user?.name || shippingAddress?.name || 'Valued Customer',
      pickup_address: shippingAddress?.address || '',
      pickup_city: shippingAddress?.city || 'Patna',
      pickup_pincode: shippingAddress?.postalCode || '',
      pickup_state: shippingAddress?.state || 'Bihar',
      pickup_country: 'India',
      pickup_email: user?.email || 'customer@royaltailors.net',
      pickup_phone: shippingAddress?.phone || user?.phone || '9999999999',
      order_items: (orderItems || []).map((item) => ({
        name: item.name,
        sku: String(item.product || item._id).substring(0, 10),
        units: item.qty || 1,
        selling_price: item.price
      })),
      length: 10, breadth: 10, height: 5, weight: 0.5
    };

    const { data } = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/return',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await Order.findByIdAndUpdate(orderId, { status: 'Return Requested' });

    res.json({ success: true, message: 'Reverse return pickup scheduled!', data });
  } catch (error) {
    console.error('Shiprocket Return Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to schedule return pickup.' });
  }
};

// 8. WEBHOOK FOR REAL-TIME TRACKING & AUTOMATED COD PAYMENT FLIP
const shiprocketWebhook = async (req, res) => {
  try {
    const trackingData = req.body;
    console.log('📦 Shiprocket Webhook Received:', trackingData);

    const { order_id, current_status, awb } = trackingData;

    if (order_id) {
      const updateFields = {};
      if (current_status) updateFields.status = current_status;
      if (awb) updateFields.awbCode = awb;

      // 🚀 FIXED: Automatically set isPaid to true when COD parcel is delivered
      if (current_status === 'DELIVERED' || current_status === 'Delivered') {
        updateFields.isDelivered = true;
        updateFields.deliveredAt = Date.now();
        updateFields.isPaid = true;
        updateFields.paidAt = Date.now();
      }

      const queryConditions = [{ shiprocketOrderId: String(order_id) }];

      if (mongoose.Types.ObjectId.isValid(order_id)) {
        queryConditions.push({ _id: order_id });
      }

      await Order.findOneAndUpdate(
        { $or: queryConditions },
        { $set: updateFields }
      );
    }

    return res.status(200).json({ success: true, message: 'Webhook Processed' });
  } catch (error) {
    console.error('Webhook Processing Error:', error.message);
    return res.status(200).json({ success: false, error: error.message });
  }
};

module.exports = { 
  checkServiceability, 
  createShiprocketOrder, 
  generateAWB, 
  generateLabel, 
  trackShipment,
  cancelShiprocketOrder,
  createReturnOrder,
  shiprocketWebhook 
};