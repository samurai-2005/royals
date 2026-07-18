import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2 } from 'react-icons/fi';

const Cart = () => {
  const { cartItems, removeFromCart, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <FiTrash2 size={32} className="text-zinc-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-zinc-500 mb-8">Looks like you haven't added any uniform components yet.</p>
        <Link to="/" className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-zinc-200 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto h-full flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-6 hidden md:block">Shopping Cart</h1>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
        {cartItems.map((item, index) => (
          <div key={`${item._id}-${index}`} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-4">
            
            <div className="w-20 h-20 bg-[#18181b] rounded-lg overflow-hidden shrink-0">
              {item.images && item.images.length > 0 ? (
                <img src={`http://localhost:5000${item.images[0]}`} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-bold">NO IMG</div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight mb-1">{item.name}</h3>
                  <p className="text-xs text-zinc-500">Size: <span className="text-white font-semibold">{item.size}</span></p>
                </div>
                <button onClick={() => removeFromCart(item._id, item.size)} className="text-zinc-500 hover:text-red-400 p-1">
                  <FiTrash2 size={16} />
                </button>
              </div>
              
              <div className="flex justify-between items-end mt-2">
                <span className="text-xs font-bold text-zinc-400">Qty: {item.qty}</span>
                <span className="text-base font-black text-white">Rs {item.price}</span>
              </div>
            </div>
            
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-zinc-800 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <span className="text-zinc-400 font-bold">Total Amount</span>
          <span className="text-2xl font-black text-white">Rs {cartTotal}</span>
        </div>
        <Link to="/checkout" className="block w-full bg-white text-black text-center font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors shadow-lg">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default Cart;