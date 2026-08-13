import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiShoppingBag, 
  FiTruck, 
  FiBell, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiAward, 
  FiPackage, 
  FiLayers,
  FiArrowLeft
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [loading, setLoading] = useState(true);

  // Set Breakdown Components State
  const [setComponents, setSetComponents] = useState([]);

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
      setLoading(true);
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

        // Fetch linked components if this is a uniform set
        if (data.subGroup === 'Set' || data.isSet) {
          const allProductsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
          const allProds = allProductsRes.data || [];

          if (Array.isArray(data.selectedComponents) && data.selectedComponents.length > 0) {
            const matched = allProds.filter(p => data.selectedComponents.includes(p._id));
            setSetComponents(matched);
          } else {
            // Fallback: If no components explicitly linked, pull items from same category
            const categoryProds = allProds.filter(p => p.mainGroup?.toLowerCase() === data.mainGroup?.toLowerCase() && p._id !== data._id && p.subGroup !== 'Set');
            setSetComponents(categoryProds.slice(0, 4)); // Show up to 4 related category items
          }
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
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
        weight: product?.weight || 0.5,
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-500 font-bold space-y-2">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-wider">Loading Product Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center text-zinc-400 space-y-4 max-w-md mx-auto">
        <FiAlertCircle size={40} className="mx-auto text-amber-500" />
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <p className="text-xs text-zinc-500">The uniform or set item you are looking for is unavailable.</p>
        <button 
          onClick={() => navigate('/catalog')}
          className="bg-zinc-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const isOutOfStock = product.countInStock !== undefined ? product.countInStock <= 0 : !product.inStock;
  const isSet = product.subGroup === 'Set' || product.isSet;

  const sub = (product.subGroup || '').toLowerCase();
  const main = (product.mainGroup || '').toLowerCase();
  const title = (product.name || '').toLowerCase();

  const isAccessories = main === 'accessories' || sub === 'accessories';
  const isShoes = sub.includes('shoe') || sub.includes('boot') || sub.includes('dms') || main.includes('shoe') || title.includes('boot') || title.includes('shoe') || title.includes('dms');

  const handleAddToCartAction = () => {
    const finalSize = isAccessories ? 'One Size' : selectedSize;
    addToCart({ ...product, size: finalSize, weight: product.weight || (isSet ? 1.2 : 0.5) });
    navigate('/cart');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 font-sans text-white">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
      >
        <FiArrowLeft size={16} /> Back to Catalog
      </button>

      {/* TOP BUY BOX GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        
        {/* LEFT: IMAGE GALLERY */}
        <div className="space-y-4">
          <div className="aspect-[4/3] md:aspect-square bg-[#18181b] border border-zinc-800/80 rounded-3xl overflow-hidden relative shadow-2xl flex items-center justify-center">
            {isSet && (
              <span className="absolute top-4 left-4 bg-amber-500 text-black text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg z-10 flex items-center gap-1.5">
                <FiAward size={13} /> COMPLETE UNIFORM BUNDLE
              </span>
            )}

            {product.discountPercentage > 0 && !isOutOfStock && !isSet && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase shadow-lg z-10">
                {product.discountPercentage}% OFF
              </span>
            )}

            {isOutOfStock && (
              <span className="absolute top-4 left-4 bg-zinc-900/90 border border-red-500/40 text-red-400 text-xs font-black px-3.5 py-1.5 rounded-full uppercase shadow-lg z-10">
                Sold Out
              </span>
            )}

            <img 
              src={getImageUrl(images[selectedImage])} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-all duration-300 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-2xl bg-[#18181b] border-2 overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                    selectedImage === idx ? 'border-amber-500 scale-95 shadow-md' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(img)} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: DETAILS & BUY ACTION */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-zinc-800 text-zinc-300 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-zinc-700/60">
                {product.mainGroup}
              </span>
              <span className="bg-zinc-800 text-amber-400 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-amber-500/30">
                {product.subGroup}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-3 mt-4">
              {product.discountPrice > 0 ? (
                <>
                  <span className="text-3xl font-black text-white">Rs {product.discountPrice}</span>
                  <span className="text-base font-bold text-zinc-500 line-through">Rs {product.price}</span>
                  <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2.5 py-0.5 rounded-full font-bold">
                    Save {product.discountPercentage}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-black text-white">Rs {product.price}</span>
              )}
            </div>
          </div>

          {/* PARCEL SPECS CARD */}
          <div className="bg-[#18181b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-2 font-bold text-zinc-300">
              <FiPackage className="text-amber-400" size={16} /> Package Specifications
            </span>
            <span className="font-mono text-white font-bold">
              Weight: <strong className="text-amber-400">{product.weight || (isSet ? 1.2 : 0.5)} kg</strong>
            </span>
          </div>

          {/* LIVE SHIPROCKET DELIVERY CHECKER */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center">
              <FiTruck className="mr-2 text-amber-400" size={16} /> Check Live Delivery & COD Serviceability
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 flex-1 font-mono"
              />
              <button 
                onClick={handleCheckPincode}
                disabled={checkingPincode}
                className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-5 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {checkingPincode ? 'Checking...' : 'Check'}
              </button>
            </div>

            {pincodeResult && (
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl text-emerald-400 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <FiCheckCircle /> Serviceable by {pincodeResult.courier}
                </div>
                <div className="text-zinc-300 text-[11px] flex justify-between pt-1">
                  <span>Est. Delivery: <strong>{pincodeResult.etd}</strong></span>
                  <span>COD: <strong>{pincodeResult.cod ? 'Available' : 'Prepaid Only'}</strong></span>
                </div>
              </div>
            )}

            {pincodeError && (
              <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-xl text-red-400 text-xs flex items-center gap-1.5">
                <FiAlertCircle /> {pincodeError}
              </div>
            )}
          </div>

          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">{product.description}</p>

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
                    className={`px-5 py-3 rounded-2xl font-bold text-xs border transition-all cursor-pointer flex items-center justify-center ${
                      selectedSize === size
                        ? 'bg-amber-500 text-black border-amber-500 shadow-lg scale-105 font-black'
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
                <div className="w-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold p-4 rounded-2xl flex items-center justify-center gap-2 text-xs">
                  <FiCheckCircle size={16} /> Subscribed! We will notify you when this item is restocked.
                </div>
              ) : (
                <button
                  onClick={handleNotifyMe}
                  disabled={subscribing}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer text-sm uppercase tracking-wider"
                >
                  <FiBell size={18} /> {subscribing ? 'Subscribing...' : 'Notify Me When In Stock'}
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleAddToCartAction}
              className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-xl cursor-pointer text-sm uppercase tracking-wider active:scale-[0.99]"
            >
              <FiShoppingBag size={18} /> {isSet ? 'Buy Complete Uniform Set' : 'Add to Cart'}
            </button>
          )}

        </div>

      </div>

      {/* BOTTOM SECTION: INCLUDED PACKAGE COMPONENTS BREAKDOWN FOR SETS */}
      {isSet && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
              <FiLayers className="text-amber-400" /> Included Package Breakdown
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Every component included in this official {product.mainGroup} dress kit package. Click any item to view its individual product page.
            </p>
          </div>

          {setComponents.length === 0 ? (
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-zinc-400">
              This uniform bundle includes all standard dress components for {product.mainGroup}.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {setComponents.map((comp) => {
                const compImg = comp.images && comp.images.length > 0 ? comp.images[0] : comp.image;

                return (
                  <div 
                    key={comp._id} 
                    onClick={() => navigate(`/product/${comp._id}`)}
                    className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/80 p-3.5 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer group shadow"
                  >
                    <div className="w-14 h-14 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {compImg ? (
                        <img src={getImageUrl(compImg)} alt={comp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <FiPackage className="text-zinc-600" size={20} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">
                        {comp.subGroup}
                      </span>
                      <h4 className="font-bold text-xs text-white truncate group-hover:text-amber-300 transition-colors">
                        {comp.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono">Component Value: Rs {comp.price}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ProductDetail;