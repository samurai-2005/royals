const axios = require('axios');

// ============================================================================
// SHIPROCKET PLACEHOLDER UTILITY
// This automatically logs in to Shiprocket if credentials exist in .env.
// Otherwise, it returns a dummy token for local testing.
// ============================================================================
const getShiprocketToken = async () => {
  if (!process.env.SHIPROCKET_EMAIL || process.env.SHIPROCKET_EMAIL.includes('example.com')) {
    console.log('[PLACEHOLDER] Generating Mock Shiprocket Token');
    return 'mock_development_token_123';
  }

  try {
    const { data } = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    });
    return data.token;
  } catch (error) {
    console.error('Shiprocket Auth Failed:', error.response?.data || error.message);
    throw new Error('Logistics authentication failed');
  }
};

// 1. DYNAMIC SHIPPING RATES (Serviceability & Pincode Check)
const checkServiceability = async (req, res) => {
  const { delivery_postcode, weight = 1, cod = 0 } = req.body;
  
  try {
    const token = await getShiprocketToken();
    
    // @todo SHIPROCKET_PLACEHOLDER: Remove this IF block when account is live
    if (token === 'mock_development_token_123') {
      return res.json({
        success: true,
        data: {
          available_courier_companies: [{
            courier_name: "Mock Delivery (Delhivery)",
            estimated_delivery_days: 3,
            rate: 150
          }]
        }
      });
    }

    // LIVE API CALL
    const { data } = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/serviceability`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        pickup_postcode: 800001, // Patna PIN as default origin
        delivery_postcode,
        weight,
        cod
      }
    });
    res.json({ success: true, data: data.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. AUTOMATED ORDER CREATION
const createShiprocketOrder = async (req, res) => {
  const { orderId, orderItems, shippingAddress, totalPrice, user } = req.body;

  try {
    const token = await getShiprocketToken();

    // @todo SHIPROCKET_PLACEHOLDER: Remove this IF block when account is live
    if (token === 'mock_development_token_123') {
      return res.json({
        success: true,
        shiprocket_order_id: `mock_sr_${Date.now()}`,
        message: "Mock Order created successfully in Shiprocket"
      });
    }

    // Format your Mongoose order into Shiprocket's required JSON payload
    const payload = {
      order_id: orderId,
      order_date: new Date().toISOString(),
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION_ID,
      billing_customer_name: user?.name || shippingAddress.name,
      billing_last_name: "",
      billing_address: shippingAddress.address,
      billing_city: shippingAddress.city,
      billing_pincode: shippingAddress.postalCode,
      billing_state: shippingAddress.state,
      billing_country: "India",
      billing_email: user?.email || "customer@example.com",
      billing_phone: shippingAddress.phone || "9999999999",
      shipping_is_billing: true,
      order_items: orderItems.map(item => ({
        name: item.name,
        sku: item.product, 
        units: item.qty,
        selling_price: item.price
      })),
      payment_method: "Prepaid",
      sub_total: totalPrice,
      length: 10, breadth: 10, height: 10, weight: 1 // Default parcel dimensions
    };

    // LIVE API CALL
    const { data } = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    res.json({ success: true, shiprocket_order_id: data.order_id, message: "Order pushed to logistics." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. AUTOMATED COURIER ASSIGNMENT (Generate AWB)
const generateAWB = async (req, res) => {
  const { shiprocket_order_id } = req.body;

  try {
    const token = await getShiprocketToken();

    // @todo SHIPROCKET_PLACEHOLDER
    if (token === 'mock_development_token_123') {
      return res.json({ success: true, awb_code: `MOCK_AWB_${Math.floor(Math.random() * 100000)}` });
    }

    // LIVE API CALL
    const { data } = await axios.post('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', 
      { shipment_id: shiprocket_order_id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json({ success: true, awb_code: data.response.data.awb_code });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. LABEL GENERATION
const generateLabel = async (req, res) => {
  const { shiprocket_shipment_ids } = req.body; // Array of IDs

  try {
    const token = await getShiprocketToken();

    // @todo SHIPROCKET_PLACEHOLDER
    if (token === 'mock_development_token_123') {
      return res.json({ success: true, label_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" });
    }

    // LIVE API CALL
    const { data } = await axios.post('https://apiv2.shiprocket.in/v1/external/courier/generate/label', 
      { shipment_id: shiprocket_shipment_ids },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json({ success: true, label_url: data.label_url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5 & 6. WEBHOOK FOR REAL-TIME TRACKING & NDR
const shiprocketWebhook = async (req, res) => {
  // Shiprocket hits this endpoint automatically when a package moves.
  const trackingData = req.body;
  
  console.log("Webhook Received from Logistics:", trackingData.current_status);
  
  // @todo SHIPROCKET_PLACEHOLDER: Update MongoDB order status based on trackingData.current_status
  // e.g., if (trackingData.current_status === 'DELIVERED') { await Order.findByIdAndUpdate(...) }

  res.status(200).send('Webhook Received');
};

module.exports = { checkServiceability, createShiprocketOrder, generateAWB, generateLabel, shiprocketWebhook };