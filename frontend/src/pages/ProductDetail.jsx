import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingBag, FiTruck, FiBell, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');

  // Live Shiprocket Pincode States
  const [pincode, setPincode] = useState('');
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeError, setPincodeError] = useState('');

  // "Notify Me" Waitlist States
  const [subscribing, setSubscribing] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);

  // Available Sizes Arrays
  const shoeSizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
  const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/500x500/18181b/ffffff?text=No+Image';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`);
        setProduct(data);

        const sub = (data.subGroup || '').toLowerCase();
        const main = (data.mainGroup || '').toLowerCase();
        const title = (data.name || '').toLowerCase();

        const isAcc = main === 'accessories' || sub === 'accessories';
        const isShoe = sub.includes('shoe') || sub.includes('boot') || sub.includes('dms') || main.includes('shoe') || title.includes('boot') || title.includes('shoe') || title.includes('dms');

        if (isAcc) {
          setSelectedSize('One Size');
        } else if (isShoe) {
          setSelectedSize('UK 7');
        } else {
          setSelectedSize('M');
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleCheckPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      setPincodeError('Enter a valid 6-digit Pincode');
      return;
    }

    setCheckingPincode(true);
    setPincodeError('');
    setPincodeResult(null);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/logistics/serviceability`, {
        delivery_postcode: pincode,
        weight: 0.5,
        cod: 1
      });

      if (data.success && data.data?.available_courier_companies?.length > 0) {
        const topCourier = data.data.available_courier_companies[0];
        setPincodeResult({
          courier: topCourier.courier_name,
          etd: topCourier.etd || '3-5 Days',
          cod: topCourier.cod === 1
        });
      } else {
        setPincodeError('Delivery is currently unavailable for this pincode.');
      }
    } catch (err) {
      console.error('Pincode check error:', err);
      setPincodeError('Unable to check delivery status.');
    } finally {
      setCheckingPincode(false);
    }
  };

  const handleNotifyMe = async () => {
    setSubscribing(true);
    try {
      let subscription = null;

      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          const publicVapidKey = import.meta.env.VITE_PUBLIC_VAPID_KEY;

          if (publicVapidKey) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: publicVapidKey
            });
          }
        }
      }

      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
      const config = userInfo?.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${product._id}/notify-me`,
        { subscription, email: userInfo?.email },
        config
      );

      setNotifySuccess(true);
    } catch (err) {
      console.error('Failed to register restock notification:', err);
      alert('Could not subscribe for restock alerts. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center h-96 text-zinc-500 font-bold">
        Loading Product Details...
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const isOutOfStock = product.countInStock !== undefined ? product.countInStock <= 0 : !product.inStock;

  const sub = (product.subGroup || '').toLowerCase();
  const main = (product.mainGroup || '').toLowerCase();
  const title = (product.name || '').toLowerCase();

  const isAccessories = main === 'accessories' || sub === 'accessories';
  const isShoes = sub.includes('shoe') || sub.includes('boot') || sub.includes('dms') || main.includes('shoe') || title.includes('boot') || title.includes('shoe') || title.includes('dms');

  const handleAddToCartAction = () => {
    const finalSize = isAccessories ? 'One Size' : selectedSize;
    addToCart({ ...product, size: finalSize });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Product Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden relative">
            <img 
              src={getImageUrl(images[selectedImage])} 
              alt={product.name} 
              className={`w-full h-full object-cover ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
            />
            
            {product.discountPercentage > 0 && !isOutOfStock && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase shadow-lg">
                {product.discountPercentage}% OFF
              </span>
            )}

            {isOutOfStock && (
              <span className="absolute top-4 left-4 bg-zinc-800 text-red-400 border border-red-500/30 text-xs font-black px-3 py-1.5 rounded-full uppercase shadow-lg">
                Sold Out
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl bg-[#18181b] border-2 overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                    selectedImage === idx ? 'border-white scale-95' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(img)} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Live Delivery Checker */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                {product.mainGroup}
              </span>
              {product.subGroup && (
                <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                  {product.subGroup}
                </span>
              )}
              {isOutOfStock && (
                <span className="bg-red-950/80 text-red-400 border border-red-800/80 text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white">{product.name}</h1>
            
            <div className="flex items-center gap-3 mt-3">
              {product.discountPrice > 0 ? (
                <>
                  <span className="text-2xl font-black text-white">Rs {product.discountPrice}</span>
                  <span className="text-sm font-bold text-zinc-500 line-through">Rs {product.price}</span>
                </>
              ) : (
                <span className="text-2xl font-black text-white">Rs {product.price}</span>
              )}
            </div>
          </div>

          {/* LIVE SHIPROCKET DELIVERY CHECKER */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-4 space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center">
              <FiTruck className="mr-2 text-amber-400" /> Check Live Delivery & COD Availability
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 flex-1"
              />
              <button 
                onClick={handleCheckPincode}
                disabled={checkingPincode}
                className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {checkingPincode ? 'Checking...' : 'Check'}
              </button>
            </div>

            {pincodeResult && (
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-lg text-emerald-400 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <FiCheckCircle /> Serviceable by {pincodeResult.courier}
                </div>
                <div className="text-zinc-300 text-[11px] flex justify-between">
                  <span>Est. Delivery: <strong>{pincodeResult.etd}</strong></span>
                  <span>COD: <strong>{pincodeResult.cod ? 'Available' : 'Prepaid Only'}</strong></span>
                </div>
              </div>
            )}

            {pincodeError && (
              <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-lg text-red-400 text-xs flex items-center gap-1.5">
                <FiAlertCircle /> {pincodeError}
              </div>
            )}
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed">{product.description}</p>

          {/* DYNAMIC SIZE SELECTOR */}
          {!isAccessories && (
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                {isShoes ? 'Select Foot Size (UK)' : 'Select Apparel Size'}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {(isShoes ? shoeSizes : clothingSizes).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer flex items-center justify-center ${
                      selectedSize === size
                        ? 'bg-amber-500 text-black border-amber-500 shadow-lg scale-105'
                        : 'bg-[#18181b] text-zinc-300 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTON */}
          {isOutOfStock ? (
            <div className="space-y-3">
              {notifySuccess ? (
                <div className="w-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold p-4 rounded-xl flex items-center justify-center gap-2 text-xs">
                  <FiCheckCircle size={16} /> Subscribed! We will notify you when this item is restocked.
                </div>
              ) : (
                <button
                  onClick={handleNotifyMe}
                  disabled={subscribing}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer text-base"
                >
                  <FiBell size={20} /> {subscribing ? 'Subscribing...' : 'Notify Me When In Stock'}
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleAddToCartAction}
              className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer text-base"
            >
              <FiShoppingBag size={20} /> Add to Cart
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

export default ProductDetail;