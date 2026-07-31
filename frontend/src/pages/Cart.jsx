import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQty, cartTotal } = useCart();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center text-zinc-400">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-600">
          <FiShoppingBag size={36} />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-sm max-w-xs md:max-w-md mb-6 text-zinc-500">
          Looks like you haven't added any uniform items or kit bundles to your cart yet.
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
            const itemPrice = item.discountPercentage > 0 ? item.discountPrice : item.price;
            const rawImg = item.images && item.images.length > 0 ? item.images[0] : item.image;
            const displayImg = getImageUrl(rawImg);

            return (
              <div 
                key={`${item._id}-${item.size}`} 
                className="bg-[#18181b] border border-zinc-800 rounded-2xl p-4 md:p-5 flex gap-4 md:gap-6 items-center shadow-lg relative"
              >
                {/* Product Image */}
                <div className="w-20 h-20 md:w-28 md:h-28 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex-shrink-0 flex items-center justify-center">
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
                </div>

                {/* Details & Controls */}
                <div className="flex-1 min-w-0 pr-8 md:pr-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4 mb-2">
                    <h3 className="font-bold text-white text-sm md:text-lg truncate">{item.name}</h3>
                    <p className="text-base md:text-lg font-black text-white">
                      Rs {itemPrice * item.qty}
                    </p>
                  </div>
                  
                  <p className="text-xs text-zinc-400 mb-3">
                    Size: <span className="text-zinc-200 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{item.size}</span>
                  </p>

                  {/* Quantity Increments (+ / -) */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 font-semibold hidden md:inline">Quantity:</span>
                    <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-inner">
                      <button 
                        onClick={() => updateQty && updateQty(item._id, item.size, item.qty - 1)}
                        className="px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30"
                        disabled={item.qty <= 1}
                        title="Decrease Quantity"
                      >
                        <FiMinus size={14} />
                      </button>
                      
                      <span className="w-8 md:w-10 text-center text-xs md:text-sm font-black text-white">
                        {item.qty}
                      </span>
                      
                      <button 
                        onClick={() => updateQty && updateQty(item._id, item.size, item.qty + 1)}
                        className="px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Increase Quantity"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button 
                  onClick={() => removeFromCart(item._id, item.size)}
                  className="absolute top-4 right-4 md:static text-zinc-500 hover:text-red-400 transition-colors p-2 hover:bg-red-950/30 rounded-lg"
                  title="Remove Item"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Order Summary (Sticky on Desktop) */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold border-b border-zinc-800 pb-4">Order Summary</h2>

          <div className="space-y-3 text-sm text-zinc-400">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="text-white font-bold text-base">Rs {cartTotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Estimated Shipping</span>
              <span className="text-green-400 font-bold text-sm">
                {cartTotal > 2000 ? 'FREE' : 'Rs 150.00'}
              </span>
            </div>
          </div>

          <hr className="border-zinc-800" />

          <div className="flex justify-between items-center text-xl font-black text-white">
            <span>Total Amount</span>
            <span>Rs {(cartTotal + (cartTotal > 2000 ? 0 : 150)).toFixed(2)}</span>
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