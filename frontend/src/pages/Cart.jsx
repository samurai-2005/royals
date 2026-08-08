import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQty, cartTotal } = useCart();

  const FREE_SHIPPING_THRESHOLD = 300;
  const BASE_SHIPPING_FEE = 60;
  const shippingFee = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING_FEE;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const getEffectivePrice = (item) => {
    if (item.discountPrice && item.discountPrice > 0) return item.discountPrice;
    if (item.discountPercentage && item.discountPercentage > 0) {
      return item.price - (item.price * item.discountPercentage) / 100;
    }
    return item.price;
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center text-zinc-400">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-600">
          <FiShoppingBag size={36} />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-sm max-w-xs md:max-w-md mb-6 text-zinc-500">
          Looks like you haven't added any items to your cart yet.
        </p>
        <button 
          onClick={() => navigate('/catalog')} 
          className="bg-white text-black font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-zinc-200 transition-colors text-sm"
        >
          Explore Uniform Directory
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto text-white pb-28">
      <h1 className="text-2xl md:text-3xl font-black mb-8 tracking-tight">Shopping Cart ({cartItems.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Item Cards */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const effectivePrice = getEffectivePrice(item);
            const rawImg = item.images && item.images.length > 0 ? item.images[0] : item.image;
            const displayImg = getImageUrl(rawImg);

            return (
              <div 
                key={`${item._id}-${item.size}`} 
                className="bg-[#18181b] border border-zinc-800 rounded-2xl p-4 md:p-5 flex gap-4 md:gap-6 items-center shadow-lg relative"
              >
                <Link 
                  to={`/product/${item._id}`}
                  className="w-20 h-20 md:w-28 md:h-28 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {displayImg ? (
                    <img 
                      src={displayImg} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-[10px] md:text-xs text-zinc-600 font-bold uppercase text-center px-1">
                      No Image
                    </span>
                  )}
                </Link>

                <div className="flex-1 min-w-0 pr-8 md:pr-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4 mb-2">
                    <Link to={`/product/${item._id}`} className="truncate hover:underline">
                      <h3 className="font-bold text-white text-sm md:text-lg truncate">{item.name}</h3>
                    </Link>
                    <p className="text-base md:text-lg font-black text-white">
                      Rs {effectivePrice * item.qty}
                    </p>
                  </div>
                  
                  <p className="text-xs text-zinc-400 mb-3">
                    Size: <span className="text-zinc-200 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{item.size}</span>
                  </p>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 font-semibold hidden md:inline">Quantity:</span>
                    <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-inner">
                      <button 
                        onClick={() => updateQty && updateQty(item._id, item.size, item.qty - 1)}
                        className="px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30"
                        disabled={item.qty <= 1}
                      >
                        <FiMinus size={14} />
                      </button>
                      
                      <span className="w-8 md:w-10 text-center text-xs md:text-sm font-black text-white">
                        {item.qty}
                      </span>
                      
                      <button 
                        onClick={() => updateQty && updateQty(item._id, item.size, item.qty + 1)}
                        className="px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => removeFromCart(item._id, item.size)}
                  className="absolute top-4 right-4 md:static text-zinc-500 hover:text-red-400 transition-colors p-2 hover:bg-red-950/30 rounded-lg"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold border-b border-zinc-800 pb-4">Order Summary</h2>

          <div className="space-y-3 text-sm text-zinc-400">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="text-white font-bold text-base">Rs {cartTotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Estimated Shipping</span>
              <span className={shippingFee === 0 ? "text-emerald-400 font-bold" : "text-white"}>
                {shippingFee === 0 ? 'FREE' : `Rs ${shippingFee.toFixed(2)}`}
              </span>
            </div>
          </div>

          <hr className="border-zinc-800" />

          <div className="flex justify-between items-center text-xl font-black text-white">
            <span>Total Amount</span>
            <span>Rs {(cartTotal + shippingFee).toFixed(2)}</span>
          </div>

          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 text-base shadow-lg"
          >
            Proceed to Checkout <FiArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Cart;