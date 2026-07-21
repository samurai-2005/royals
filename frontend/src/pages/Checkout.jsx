import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { FiMapPin, FiCreditCard, FiCheckCircle } from 'react-icons/fi';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  
  // User Authentication Check
  const userInfoString = localStorage.getItem('userInfo');
  const user = userInfoString ? JSON.parse(userInfoString) : null;

  // Shipping Form State
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    state: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to login if not authenticated, or to cart if cart is empty
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  // Handle Form Inputs
  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  // Calculate Prices
  const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 2000 ? 0 : 150; // Free shipping over Rs 2000
  const totalPrice = (Number(itemsPrice) + Number(shippingPrice)).toFixed(2);

  // Submit Order Payload
  const placeOrderHandler = async () => {
    setLoading(true);
    setError('');

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Format cart items to match the Mongoose schema exactly with a strict image fallback
      const orderItems = cartItems.map(item => ({
        name: item.name,
        qty: item.qty,
        image: (item.images && item.images.length > 0) ? item.images[0] : '/no-image-available.jpg',
        price: item.price,
        size: item.size,
        product: item._id
      }));

      const payload = {
        orderItems,
        shippingAddress,
        paymentMethod: 'Mock Razorpay',
        itemsPrice,
        shippingPrice,
        totalPrice,
      };

      await axios.post('http://localhost:5000/api/orders', payload, config);
      
      // Order Success! Clear the cart and redirect to the user's order history
      clearCart();
      navigate('/user-profile');

    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 h-full overflow-y-auto">
      <h1 className="text-2xl md:text-3xl font-black text-white mb-8">Secure Checkout</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded mb-6 font-semibold">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Shipping & Payment Info */}
        <div className="w-full lg:w-2/3 space-y-6">
          
          {/* Shipping Address Form */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white flex items-center mb-4">
              <FiMapPin className="mr-2 text-zinc-400" /> Delivery Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Street Address</label>
                <input required type="text" name="address" value={shippingAddress.address} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500" placeholder="Flat No, Building, Street Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">City</label>
                <input required type="text" name="city" value={shippingAddress.city} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500" placeholder="e.g. Patna" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">PIN Code</label>
                <input required type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleChange} maxLength="6" className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500" placeholder="6-Digit PIN" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">State</label>
                <input required type="text" name="state" value={shippingAddress.state} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500" placeholder="e.g. Bihar" />
              </div>
            </div>
          </div>

          {/* Payment Method Stub */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 shadow-lg">
             <h2 className="text-lg font-bold text-white flex items-center mb-4">
              <FiCreditCard className="mr-2 text-zinc-400" /> Payment Gateway
            </h2>
            <div className="bg-zinc-900 border border-zinc-700 rounded p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-white rounded-full mr-3 border-4 border-zinc-900 ring-1 ring-white"></div>
                <span className="text-white font-bold">Razorpay (UPI, Cards, NetBanking)</span>
              </div>
              <span className="text-xs bg-yellow-900/30 text-yellow-500 px-2 py-1 rounded font-bold uppercase">Test Mode</span>
            </div>
            <p className="text-xs text-zinc-500 mt-3">In production, clicking Place Order will open the secure Razorpay overlay.</p>
          </div>

        </div>

        {/* Right Side: Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 shadow-lg sticky top-6">
            <h2 className="text-lg font-bold text-white mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-zinc-900 p-3 rounded border border-zinc-800/50">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-12 h-12 bg-zinc-800 rounded flex-shrink-0">
                      {item.images && <img src={`http://localhost:5000${item.images[0]}`} className="w-full h-full object-cover rounded" alt="thumb"/>}
                    </div>
                    <div className="truncate">
                      <p className="text-sm text-white font-bold truncate">{item.name}</p>
                      <p className="text-xs text-zinc-500">Size: {item.size} x {item.qty}</p>
                    </div>
                  </div>
                  <span className="text-sm text-white font-bold whitespace-nowrap pl-2">
                    Rs {item.price * item.qty}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Items Total</span>
                <span>Rs {addDecimals(itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'FREE' : `Rs ${addDecimals(shippingPrice)}`}</span>
              </div>
              <div className="border-t border-zinc-700 pt-3 flex justify-between text-white font-black text-lg">
                <span>Total</span>
                <span>Rs {totalPrice}</span>
              </div>
            </div>

            <button 
              onClick={placeOrderHandler}
              disabled={loading || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode}
              className="w-full bg-white text-black font-black py-4 rounded-lg shadow-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? 'Processing...' : (
                <>
                  <FiCheckCircle className="mr-2" size={18} /> Place Secure Order
                </>
              )}
            </button>
            {(!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) && (
              <p className="text-xs text-red-400 mt-3 text-center">Please fill out all shipping details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;