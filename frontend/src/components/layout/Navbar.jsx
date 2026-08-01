import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiUser, FiMenu } from 'react-icons/fi';
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
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* TOP ROW: Brand, Mobile Menu, User Actions */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={toggleSidebar} 
              className="md:hidden text-zinc-400 hover:text-white p-1"
            >
              <FiMenu size={22} />
            </button>

            {/* Brand Logo */}
            <Link to="/" className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="bg-white text-black px-2 py-0.5 rounded text-xs md:text-sm font-black">RT</span>
              The Royal Tailor
            </Link>
          </div>

          {/* Right Action Icons for Mobile (Cart & Profile) */}
          <div className="flex items-center gap-4 md:hidden">
            {/* Mobile Cart Icon with Badge */}
            <Link to="/cart" className="relative text-zinc-300 hover:text-white p-1">
              <FiShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to="/user-profile" className="text-zinc-300 hover:text-white p-1">
              <FiUser size={22} />
            </Link>
          </div>
        </div>

        {/* SEARCH BAR: Visible on both PC and Mobile */}
        <form onSubmit={handleSearch} className="w-full md:max-w-md relative">
          <input
            type="text"
            placeholder="Search uniform codes, categories..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-[#18181b] border border-zinc-800 text-white placeholder-zinc-500 text-xs md:text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
        </form>

        {/* PC RIGHT ACTIONS: Cart & User */}
        <div className="hidden md:flex items-center gap-6">
          {/* PC Cart Icon with Badge */}
          <Link to="/cart" className="relative text-zinc-300 hover:text-white transition-colors flex items-center gap-2">
            <div className="relative">
              <FiShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-xs font-bold">Cart</span>
          </Link>

          <Link to="/user-profile" className="flex items-center gap-2 text-zinc-300 hover:text-white text-xs font-bold transition-colors">
            <FiUser size={18} /> Account
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Navbar;