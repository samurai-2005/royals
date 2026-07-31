import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQty, cartTotal } = useCart();

  // UNIVERSAL IMAGE URL HELPER
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
        <h2 className="text-xl font-bold text-white mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-sm max-w-xs mb-6 text-zinc-500">
          Looks like you haven't added any uniform items or accessories to your cart yet.
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-white text-black font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-zinc-200 transition-colors text-sm"
        >
          Explore Uniform Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto text-white pb-24">
      <h1 className="text-2xl font-black mb-6 tracking-tight">Shopping Cart ({cartItems.length})</h1>

      <div className="space-y-4 mb-8">
        {cartItems.map((item) => {
          const itemPrice = item.discountPercentage > 0 ? item.discountPrice : item.price;
          const rawImg = item.images && item.images.length > 0 ? item.images[0] : item.image;
          const displayImg = getImageUrl(rawImg);

          return (
            <div 
              key={`${item._id}-${item.size}`} 
              className="bg-[#18181b] border border-zinc-800 rounded-xl p-4 flex gap-4 items-center shadow-lg relative"
            >
              {/* Product Thumbnail */}
              <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0 flex items-center justify-center">
                {displayImg ? (
                  <img 
                    src={displayImg} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-xs text-zinc-600 font-bold uppercase">No Image</span>
                )}
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start pr-6">
                  <h3 className="font-bold text-white text-sm md:text-base truncate">{item.name}</h3>
                </div>
                
                <p className="text-xs text-zinc-400 mt-0.5">
                  Size: <span className="text-zinc-200 font-semibold">{item.size}</span>
                </p>

                <p className="text-base font-black text-white mt-2">
                  Rs {itemPrice * item.qty}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => updateQty && updateQty(item._id, item.size, item.qty - 1)}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      disabled={item.qty <= 1}
                    >
                      <FiMinus size={14} />
                    </button>
                    
                    <span className="w-8 text-center text-xs font-bold text-white">{item.qty}</span>
                    
                    <button 
                      onClick={() => updateQty && updateQty(item._id, item.size, item.qty + 1)}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button 
                onClick={() => removeFromCart(item._id, item.size)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 transition-colors p-1"
                title="Remove Item"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Cart Summary & Checkout Bar */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center text-zinc-400 text-sm">
          <span>Subtotal</span>
          <span className="text-white font-bold text-base">Rs {cartTotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center text-zinc-400 text-sm">
          <span>Estimated Shipping</span>
          <span className="text-green-400 font-bold text-sm">
            {cartTotal > 2000 ? 'FREE' : 'Rs 150.00'}
          </span>
        </div>

        <hr className="border-zinc-800 my-2" />

        <div className="flex justify-between items-center text-lg font-black text-white">
          <span>Total Amount</span>
          <span>Rs {(cartTotal + (cartTotal > 2000 ? 0 : 150)).toFixed(2)}</span>
        </div>

        <button 
          onClick={() => navigate('/checkout')}
          className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 text-base shadow-lg mt-2"
        >
          Proceed to Checkout <FiArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Cart;