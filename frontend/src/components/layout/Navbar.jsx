import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX, FiBell } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const Navbar = ({ toggleSidebar }) => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword.trim()}`);
    }
  };

  return (
    <header className="bg-[#0f0f0f] border-b border-zinc-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        
        {/* TOP ROW: Brand Name & Quick Action Icons */}
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar} 
              className="md:hidden text-zinc-400 hover:text-white p-1"
              aria-label="Toggle Menu"
            >
              <FiMenu size={22} />
            </button>

            <Link to="/" className="text-lg md:text-xl font-black text-white tracking-wider uppercase flex items-center gap-2">
              ROYAL TAILOR
            </Link>
          </div>

          {/* PC Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:block w-full max-w-md relative mx-4">
            <input
              type="text"
              placeholder="Search uniform codes, categories..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-[#18181b] border border-zinc-800 text-white placeholder-zinc-500 text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          </form>

          {/* Actions: Notification Bell + Cart + Profile */}
          <div className="flex items-center gap-4">
            <button className="text-zinc-300 hover:text-white p-1" aria-label="Notifications">
              <FiBell size={20} />
            </button>

            <Link to="/cart" className="relative text-zinc-300 hover:text-white transition-colors p-1">
              <FiShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to="/user-profile" className="hidden md:flex items-center gap-2 text-zinc-300 hover:text-white text-xs font-bold transition-colors">
              <FiUser size={18} /> Account
            </Link>
          </div>
        </div>

        {/* ALWAYS-VISIBLE MOBILE SEARCH BAR */}
        <div className="block md:hidden w-full">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search uniforms, badges, accessories..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-[#18181b] border border-zinc-800 text-white placeholder-zinc-500 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
            {keyword && (
              <button 
                type="button" 
                onClick={() => setKeyword('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <FiX size={14} />
              </button>
            )}
          </form>
        </div>

      </div>
    </header>
  );
};

export default Navbar;