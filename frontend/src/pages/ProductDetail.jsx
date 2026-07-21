import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { FiArrowLeft, FiCheck, FiShoppingCart, FiMinus, FiPlus, FiMapPin, FiTruck } from 'react-icons/fi';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [size, setSize] = useState('M'); 
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    // Determine the active price to add to cart
    const activePrice = product.discountPercentage > 0 ? product.discountPrice : product.price;
    addToCart({ ...product, price: activePrice }, size, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handlePincodeCheck = () => {
    if (pincode.length !== 6) {
      setDeliveryInfo({ error: "Please enter a valid 6-digit PIN code." });
      return;
    }

    setCheckingPincode(true);
    setDeliveryInfo(null);

    setTimeout(() => {
      const today = new Date();
      let deliveryDays = 5; 

      if (pincode.startsWith('800') || pincode.startsWith('801')) {
        deliveryDays = 2;
      }

      today.setDate(today.getDate() + deliveryDays);
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      const formattedDate = today.toLocaleDateString('en-IN', options);

      if (Math.random() < 0.05) {
        setDeliveryInfo({ error: "Currently, our logistics partners do not deliver to this location." });
      } else {
        setDeliveryInfo({
          success: true,
          date: formattedDate,
          message: `Delivery available by ${formattedDate}`
        });
      }
      
      setCheckingPincode(false);
    }, 800);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full text-zinc-400">Loading product data...</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center h-full text-zinc-400">Product not found.</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12">
      
      <button 
        onClick={() => navigate(-1)}
        className="md:hidden flex items-center text-zinc-400 hover:text-white font-semibold text-sm mb-2 w-fit"
      >
        <FiArrowLeft className="mr-2" /> Back
      </button>

      <div className="w-full md:w-1/2 flex-shrink-0">
        <div className="bg-[#18181b] rounded-2xl border border-zinc-800 overflow-hidden aspect-square flex items-center justify-center relative">
          
          {/* Sale Badge */}
          {product.discountPercentage > 0 && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-lg z-10 shadow-lg tracking-wider">
              {product.discountPercentage}% OFF
            </div>
          )}

          {product.images && product.images.length > 0 ? (
            <img 
              src={`http://localhost:5000${product.images[0]}`} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-zinc-600 font-bold uppercase tracking-widest">No Image Available</span>
          )}
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col">
        
        <div className="flex items-center space-x-2 mb-3">
          <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
            {product.mainGroup}
          </span>
          <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
            {product.subGroup}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
          {product.name}
        </h1>
        
        {/* Price Display Block */}
        <div className="flex items-center gap-3 mb-6">
          {product.discountPercentage > 0 ? (
            <>
              <span className="text-3xl font-black text-white">Rs {product.discountPrice}</span>
              <span className="text-xl font-bold text-zinc-500 line-through">Rs {product.price}</span>
            </>
          ) : (
            <span className="text-3xl font-black text-white">Rs {product.price}</span>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
          <div className="flex items-center text-white font-bold mb-3">
            <FiMapPin className="mr-2 text-zinc-400" /> 
            Check Delivery Availability
          </div>
          <div className="flex space-x-2">
            <input 
              type="text" 
              maxLength="6"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} 
              placeholder="Enter 6-digit Pincode (e.g. 800001)" 
              className="flex-1 bg-[#18181b] border border-zinc-700 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
            />
            <button 
              onClick={handlePincodeCheck}
              disabled={checkingPincode || pincode.length !== 6}
              className="bg-zinc-800 text-white font-bold px-6 py-2 rounded text-sm hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              {checkingPincode ? 'Checking...' : 'Check'}
            </button>
          </div>

          {deliveryInfo?.error && (
            <p className="text-red-400 text-xs mt-3 font-semibold">{deliveryInfo.error}</p>
          )}
          {deliveryInfo?.success && (
            <div className="flex items-center text-green-400 text-sm mt-3 font-semibold">
              <FiTruck className="mr-2" size={16} /> 
              {deliveryInfo.message}
            </div>
          )}
        </div>

        <p className="text-zinc-400 leading-relaxed mb-8 text-sm md:text-base">
          {product.description}
        </p>

        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Size</h3>
            <button className="text-xs text-zinc-500 hover:text-white underline underline-offset-2">Size Guide</button>
          </div>
          <div className="flex space-x-3">
            {availableSizes.map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`w-12 h-12 rounded-lg font-bold transition-colors border ${
                  size === s 
                    ? 'bg-white text-black border-white' 
                    : 'bg-[#18181b] text-zinc-400 border-zinc-700 hover:border-zinc-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-4 mb-8">
          <div className="flex items-center bg-[#18181b] border border-zinc-700 rounded-lg">
            <button 
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="p-4 text-zinc-400 hover:text-white transition-colors"
            >
              <FiMinus />
            </button>
            <span className="w-8 text-center font-bold text-white">{qty}</span>
            <button 
              onClick={() => setQty(qty + 1)}
              className="p-4 text-zinc-400 hover:text-white transition-colors"
            >
              <FiPlus />
            </button>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={added}
            className={`flex-1 flex items-center justify-center font-bold text-lg rounded-lg transition-all shadow-lg ${
              added 
                ? 'bg-green-500 text-black pointer-events-none' 
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {added ? (
              <>
                <FiCheck className="mr-2" size={24} /> Added to Cart
              </>
            ) : (
              <>
                <FiShoppingCart className="mr-2" /> Add to Cart
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;