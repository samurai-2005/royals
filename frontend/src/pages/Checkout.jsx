import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { FiLock, FiMapPin, FiTruck, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState({
    address: 'Rupaspur, Bailey Road',
    city: 'Patna',
    postalCode: '801503',
    state: 'Bihar'
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pincode Serviceability States
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [serviceability, setServiceability] = useState(null);
  const [pincodeError, setPincodeError] = useState('');

  // Free shipping on orders ₹300 and above
  const FREE_SHIPPING_THRESHOLD = 300;
  const BASE_SHIPPING_FEE = 60;
  const shippingFee = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING_FEE;
  const grandTotal = cartTotal + shippingFee;

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const handleCheckPincode = async () => {
    if (!shippingAddress.postalCode || shippingAddress.postalCode.length < 6) {
      setPincodeError('Enter a valid 6-digit Pincode');
      return;
    }

    setCheckingPincode(true);
    setPincodeError('');
    setServiceability(null);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/logistics/serviceability`, {
        delivery_postcode: shippingAddress.postalCode,
        weight: 0.5,
        cod: paymentMethod === 'COD' ? 1 : 0
      });

      if (data.success && data.data?.available_courier_companies?.length > 0) {
        const fastestCourier = data.data.available_courier_companies[0];
        setServiceability({
          available: true,
          courier: fastestCourier.courier_name,
          etd: fastestCourier.etd || '3-5 Days',
          codAvailable: fastestCourier.cod === 1
        });
      } else {
        setPincodeError('Delivery is currently unavailable for this pincode.');
      }
    } catch (err) {
      console.error('Serviceability check error:', err);
      setPincodeError('Could not verify pincode serviceability.');
    } finally {
      setCheckingPincode(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo || !userInfo.token) {
      setError('Please log in to place an order.');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      const orderPayload = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          size: item.size,
          image: item.images && item.images.length > 0 ? item.images[0] : '',
          price: item.discountPercentage > 0 ? item.discountPrice : item.price,
          product: item._id
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: cartTotal,
        shippingPrice: shippingFee,
        totalPrice: grandTotal
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders`, 
        orderPayload, 
        config
      );

      // Background Shiprocket Sync
      try {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/logistics/create-order`, {
          orderId: data._id,
          orderItems: orderPayload.orderItems,
          shippingAddress,
          totalPrice: grandTotal,
          user: userInfo,
          paymentMethod
        }, config);
      } catch (shiprocketErr) {
        console.warn('Shiprocket background sync deferred to Admin action:', shiprocketErr);
      }

      clearCart();
      navigate('/user-profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed while placing order.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p className="text-xl mb-4">Your cart is empty.</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-white text-black font-bold px-6 py-2 rounded-lg"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto text-white">
      <h1 className="text-3xl font-black mb-8 flex items-center">
        <FiLock className="mr-3 text-zinc-400"/> Secure Checkout
      </h1>

      {/* Free Delivery Threshold Alert */}
      {cartTotal < FREE_SHIPPING_THRESHOLD && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl mb-6 flex items-center justify-between text-xs md:text-sm font-semibold">
          <span className="flex items-center gap-2">
            <FiTruck size={18} />
            Add Rs {(FREE_SHIPPING_THRESHOLD - cartTotal).toFixed(2)} more to qualify for <strong>FREE DELIVERY</strong>!
          </span>
          <Link to="/catalog" className="underline font-bold text-white hover:text-amber-300">
            Browse More
          </Link>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-lg mb-6 font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SHIPPING FORM */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FiMapPin className="mr-2"/> Delivery Address
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Street Address</label>
                <input 
                  type="text" 
                  name="address" 
                  required 
                  value={shippingAddress.address} 
                  onChange={handleChange} 
                  className="w-full bg-[#0f0f0f] border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">City</label>
                  <input 
                    type="text" 
                    name="city" 
                    required 
                    value={shippingAddress.city} 
                    onChange={handleChange} 
                    className="w-full bg-[#0f0f0f] border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">PIN Code</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      name="postalCode" 
                      required 
                      value={shippingAddress.postalCode} 
                      onChange={handleChange} 
                      className="w-full bg-[#0f0f0f] border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={handleCheckPincode}
                      disabled={checkingPincode}
                      className="bg-zinc-800 hover:bg-zinc-700 text-xs text-amber-400 font-bold px-3 rounded-lg border border-zinc-700 transition-colors flex-shrink-0"
                    >
                      {checkingPincode ? 'Checking...' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Serviceability Feedback */}
              {serviceability && (
                <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-lg text-emerald-400 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <FiCheckCircle /> Serviceable by {serviceability.courier}
                  </span>
                  <span className="text-zinc-300">Est. Delivery: <strong>{serviceability.etd}</strong></span>
                </div>
              )}

              {pincodeError && (
                <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-lg text-red-400 text-xs flex items-center gap-1.5">
                  <FiAlertCircle /> {pincodeError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">State</label>
                <input 
                  type="text" 
                  name="state" 
                  required 
                  value={shippingAddress.state} 
                  onChange={handleChange} 
                  className="w-full bg-[#0f0f0f] border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Payment Option</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 bg-[#0f0f0f] p-4 rounded-lg border border-zinc-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="COD" 
                  checked={paymentMethod === 'COD'} 
                  onChange={() => setPaymentMethod('COD')}
                />
                <span className="font-bold text-white">Cash on Delivery (COD)</span>
              </label>
              <label className="flex items-center space-x-3 bg-[#0f0f0f] p-4 rounded-lg border border-zinc-700 cursor-pointer opacity-60">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Online" 
                  disabled 
                  checked={paymentMethod === 'Online'} 
                  onChange={() => setPaymentMethod('Online')}
                />
                <span className="font-bold text-zinc-400">Online Payment / UPI (Coming Soon)</span>
              </label>
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl shadow-lg h-fit space-y-6">
          <h2 className="text-xl font-bold border-b border-zinc-800 pb-4">Order Summary</h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const rawImg = item.images && item.images.length > 0 ? item.images[0] : item.image;
              const displayImg = getImageUrl(rawImg);

              return (
                <div key={`${item._id}-${item.size}`} className="flex items-center justify-between text-sm gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link 
                      to={`/product/${item._id}`}
                      className="w-12 h-12 bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      {displayImg ? (
                        <img src={displayImg} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] text-zinc-600 font-bold uppercase">N/A</span>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <Link to={`/product/${item._id}`} className="hover:underline block truncate">
                        <p className="font-bold text-white truncate">{item.name}</p>
                      </Link>
                      <p className="text-xs text-zinc-500">Size: {item.size} x {item.qty}</p>
                    </div>
                  </div>

                  <span className="font-bold text-white flex-shrink-0">
                    Rs {(item.discountPercentage > 0 ? item.discountPrice : item.price) * item.qty}
                  </span>
                </div>
              );
            })}
          </div>

          <hr className="border-zinc-800" />

          <div className="space-y-2 text-sm text-zinc-400">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="text-white">Rs {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className={shippingFee === 0 ? "text-emerald-400 font-bold" : "text-white"}>
                {shippingFee === 0 ? 'FREE' : `Rs ${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-zinc-800">
              <span>Total Amount</span>
              <span>Rs {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-black py-4 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 text-lg shadow-lg"
          >
            {loading ? 'Placing Order...' : 'Confirm Order'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Checkout;