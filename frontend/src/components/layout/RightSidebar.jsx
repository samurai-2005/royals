import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FiTrash2 } from 'react-icons/fi';

const RightSidebar = () => {
  const { cartItems, removeFromCart, cartTotal, cartCount } = useCart();

  return (
    <div className="w-72 bg-[#18181b] border-l border-zinc-800 h-full flex flex-col shrink-0">
      
      {/* Top Section: Recommendations */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
          Recommended Add-ons
        </h2>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 mb-3 flex space-x-3 items-center hover:border-zinc-600 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-[#0f0f0f] rounded shrink-0"></div>
          <div>
            <h3 className="text-xs font-bold text-white leading-tight">Bihar Police Belt</h3>
            <p className="text-[10px] text-green-400 font-semibold mt-1">15% Off Today</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 mb-3 flex space-x-3 items-center hover:border-zinc-600 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-[#0f0f0f] rounded shrink-0"></div>
          <div>
            <h3 className="text-xs font-bold text-white leading-tight">NCC Beret (Green)</h3>
            <p className="text-[10px] text-zinc-500 mt-1">Popular Match</p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Sticky Mini Cart */}
      <div className="bg-[#0f0f0f] border-t border-zinc-800 p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[50%]">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Your Order
          </h2>
          <span className="text-white bg-zinc-800 px-2 py-0.5 rounded text-xs font-bold border border-zinc-700">
            {cartCount} Items
          </span>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-xs text-zinc-500 mb-4">Your cart is currently empty.</p>
        ) : (
          <div className="space-y-4 mb-4 overflow-y-auto pr-1 scrollbar-hide flex-1">
            {cartItems.map((item, index) => (
              <div key={`${item._id}-${index}`} className="flex justify-between items-start text-sm group">
                <div className="flex-1 pr-2">
                  <p className="text-white font-semibold truncate max-w-[140px] text-xs">{item.name}</p>
                  <p className="text-zinc-500 text-[10px] mt-0.5">Qty: {item.qty} | Size: {item.size}</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <p className="text-white font-bold text-xs whitespace-nowrap">Rs {item.price * item.qty}</p>
                  <button 
                    onClick={() => removeFromCart(item._id, item.size)} 
                    className="text-zinc-600 hover:text-red-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-zinc-800 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-400 text-xs font-bold">Subtotal:</span>
            <span className="text-white text-lg font-black">Rs {cartTotal}</span>
          </div>

          <Link 
            to="/cart" 
            className={`block w-full text-center font-bold py-2.5 text-sm rounded transition-colors ${
              cartItems.length > 0 
                ? 'bg-white text-black hover:bg-zinc-200' 
                : 'bg-zinc-800 text-zinc-500 pointer-events-none'
            }`}
          >
            Review Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;