import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight, FiTag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const RightSidebar = () => {
  const { cartItems } = useCart();
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch products and filter for active sales
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        const sales = data.filter(p => p.discountPercentage > 0);
        setDiscountedProducts(sales);
      } catch (error) {
        console.error("Failed to fetch deals", error);
      }
    };
    fetchDeals();
  }, []);

  // Slideshow auto-play logic
  useEffect(() => {
    if (discountedProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % discountedProducts.length);
    }, 4000); // Change slide every 4 seconds
    return () => clearInterval(timer);
  }, [discountedProducts]);

  // Calculate Cart totals
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="w-72 bg-[#18181b] border-l border-zinc-800 p-5 flex flex-col h-full z-10 shadow-2xl relative pt-6">
      
      {/* Slideshow Section */}
      <div className="mb-8 flex-1">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center">
          <FiTag className="mr-2" /> Flash Sales
        </h2>
        
        {discountedProducts.length > 0 ? (
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group shadow-lg">
            <Link to={`/product/${discountedProducts[currentIndex]._id}`} className="block relative aspect-square">
              
              {/* Sale Badge */}
              <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded z-10 shadow-lg">
                {discountedProducts[currentIndex].discountPercentage}% OFF
              </div>
              
              {/* Image */}
              {discountedProducts[currentIndex].images?.length > 0 ? (
                <img 
                  src={`http://localhost:5000${discountedProducts[currentIndex].images[0]}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  alt="deal"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs">No Image</div>
              )}

              {/* Gradient Overlay & Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
                 <p className="text-white font-bold text-sm truncate">{discountedProducts[currentIndex].name}</p>
                 <div className="flex items-center gap-2 mt-1">
                   <span className="text-lg font-black text-white">Rs {discountedProducts[currentIndex].discountPrice}</span>
                   <span className="text-xs font-bold text-zinc-400 line-through">Rs {discountedProducts[currentIndex].price}</span>
                 </div>
              </div>
            </Link>

            {/* Slideshow Manual Controls */}
            <button 
              onClick={() => setCurrentIndex(prev => (prev === 0 ? discountedProducts.length - 1 : prev - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 backdrop-blur-sm"
            >
              <FiChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentIndex(prev => (prev + 1) % discountedProducts.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 backdrop-blur-sm"
            >
              <FiChevronRight size={16} />
            </button>

            {/* Slide Indicators */}
            <div className="absolute top-3 right-3 flex gap-1.5 z-10">
              {discountedProducts.map((_, idx) => (
                <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]' : 'bg-white/40'}`} />
              ))}
            </div>
          </div>
        ) : (
           <div className="text-xs text-zinc-500 border border-zinc-800 border-dashed rounded p-4 text-center">
             No active sales right now.
           </div>
        )}
      </div>

      {/* Mini Cart Summary */}
      <div className="mt-auto border-t border-zinc-800 pt-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-zinc-400 uppercase">Your Order</span>
          <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded">
            {cartItems.reduce((acc, item) => acc + item.qty, 0)} Items
          </span>
        </div>
        
        <div className="flex justify-between items-end mb-4">
          <span className="text-xs font-semibold text-zinc-500">Subtotal:</span>
          <span className="text-xl font-black text-white">Rs {itemsPrice.toFixed(2)}</span>
        </div>

        <Link 
          to="/cart"
          className="w-full bg-zinc-800 hover:bg-white hover:text-black text-white font-bold py-3 rounded-lg transition-colors flex justify-center text-sm"
        >
          Review Cart
        </Link>
      </div>
    </div>
  );
};

export default RightSidebar;