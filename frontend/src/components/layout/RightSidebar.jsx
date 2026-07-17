import { Link } from 'react-router-dom';

const RightSidebar = () => {
  // MOCK DATA: We will replace this with real global state later
  const cartItems = [
    { id: 1, name: "Standard NCC Shirt", price: 450, qty: 1, size: "M" }
  ];
  
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <aside className="w-80 bg-[#18181b] border-l border-zinc-800 h-full flex flex-col hidden xl:flex shrink-0">
      
      {/* Top Section: Recommendations & Deals */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
          Recommended Add-ons
        </h2>
        
        {/* Mock Recommended Item 1 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded p-3 mb-4 flex space-x-3 items-center hover:border-zinc-600 transition-colors cursor-pointer">
          <div className="w-16 h-16 bg-[#0f0f0f] rounded flex-shrink-0"></div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">Bihar Police Belt</h3>
            <p className="text-xs text-green-400 font-semibold mt-1">15% Off Today</p>
            <p className="text-sm text-zinc-300 mt-1">Rs 250</p>
          </div>
        </div>

        {/* Mock Recommended Item 2 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded p-3 mb-4 flex space-x-3 items-center hover:border-zinc-600 transition-colors cursor-pointer">
          <div className="w-16 h-16 bg-[#0f0f0f] rounded flex-shrink-0"></div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">NCC Beret (Green)</h3>
            <p className="text-xs text-zinc-500 mt-1">Popular Match</p>
            <p className="text-sm text-zinc-300 mt-1">Rs 150</p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Sticky Mini Cart */}
      <div className="bg-[#0f0f0f] border-t border-zinc-800 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Your Order
          </h2>
          <span className="text-white bg-zinc-800 px-2 py-0.5 rounded text-xs font-bold border border-zinc-700">
            {cartItems.length} Items
          </span>
        </div>

        {/* Cart Item List */}
        {cartItems.length === 0 ? (
          <p className="text-xs text-zinc-500 mb-4">Your cart is currently empty.</p>
        ) : (
          <div className="space-y-4 mb-6">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div>
                  <p className="text-white font-semibold truncate max-w-[150px]">{item.name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">Qty: {item.qty} | Size: {item.size}</p>
                </div>
                <p className="text-white font-bold whitespace-nowrap">Rs {item.price}</p>
              </div>
            ))}
          </div>
        )}

        {/* Total & Checkout Button */}
        <div className="pt-4 border-t border-zinc-800">
          <div className="flex justify-between items-center mb-5">
            <span className="text-zinc-400 text-sm font-bold">Subtotal:</span>
            <span className="text-white text-xl font-bold">Rs {cartTotal}</span>
          </div>

          <Link 
            to="/checkout" 
            className="block w-full bg-white text-black text-center font-bold py-3 rounded hover:bg-zinc-200 transition-colors shadow-lg"
          >
            Secure Checkout
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;