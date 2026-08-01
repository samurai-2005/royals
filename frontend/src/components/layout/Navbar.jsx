import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const Navbar = ({ toggleSidebar }) => {
  const [keyword, setKeyword] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword.trim()}`);
      setShowMobileSearch(false);
    }
  };

  return (
    <header className="bg-[#0f0f0f] border-b border-zinc-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar} 
            className="md:hidden text-zinc-400 hover:text-white p-1"
            aria-label="Toggle Menu"
          >
            <FiMenu size={22} />
          </button>

          <Link to="/" className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="bg-white text-black px-2 py-0.5 rounded text-xs md:text-sm font-black">RT</span>
            <span className="truncate">The Royal Tailor</span>
          </Link>
        </div>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:block w-full max-w-md relative">
          <input
            type="text"
            placeholder="Search uniform codes, categories..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-[#18181b] border border-zinc-800 text-white placeholder-zinc-500 text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
        </form>

        {/* Right Action Icons (Mobile & Desktop) */}
        <div className="flex items-center gap-3 md:gap-6">
          
          {/* Mobile Search Toggle Icon */}
          <button 
            onClick={() => setShowMobileSearch(!showMobileSearch)} 
            className="md:hidden text-zinc-300 hover:text-white p-1"
            aria-label="Toggle Search"
          >
            {showMobileSearch ? <FiX size={20} /> : <FiSearch size={20} />}
          </button>

          {/* Cart Icon with Number Badge */}
          <Link to="/cart" className="relative text-zinc-300 hover:text-white transition-colors flex items-center gap-2 p-1">
            <div className="relative">
              <FiShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline text-xs font-bold">Cart</span>
          </Link>

          {/* Account Link */}
          <Link to="/user-profile" className="text-zinc-300 hover:text-white transition-colors flex items-center gap-2 p-1">
            <FiUser size={20} />
            <span className="hidden md:inline text-xs font-bold">Account</span>
          </Link>

        </div>
      </div>

      {/* Expandable Mobile Search Input Bar */}
      {showMobileSearch && (
        <div className="md:hidden pt-3 mt-2 border-t border-zinc-800/80 animate-fade-in">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search uniforms, badges, accessories..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              autoFocus
              className="w-full bg-[#18181b] border border-zinc-700 text-white placeholder-zinc-500 text-sm rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-white transition-colors"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            {keyword && (
              <button 
                type="button" 
                onClick={() => setKeyword('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <FiX size={16} />
              </button>
            )}
          </form>
        </div>
      )}
    </header>
  );
};

export default Navbar;