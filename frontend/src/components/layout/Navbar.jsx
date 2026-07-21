import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiBell, FiUser, FiMenu, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const Navbar = ({ toggleMenu }) => {
  const navigate = useNavigate();
  useLocation();
  
  const { cartCount } = useCart();
  const [keyword, setKeyword] = useState('');

  const userInfoString = localStorage.getItem('userInfo');
  const user = userInfoString ? JSON.parse(userInfoString) : null;

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="h-16 bg-[#0f0f0f] border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 shrink-0 z-50">
      
      <div className="flex items-center">
        <button 
          onClick={toggleMenu}
          className="text-zinc-400 hover:text-white transition-colors mr-4 md:hidden block"
        >
          <FiMenu size={24} />
        </button>

        <Link to="/" className="text-xl font-bold tracking-wide text-white hover:text-zinc-300 transition-colors">
          The Royal Tailor
        </Link>
      </div>

      <form 
        onSubmit={submitHandler}
        className="hidden md:flex items-center bg-zinc-900 rounded-full px-4 py-2 w-1/3 max-w-md border border-zinc-800 focus-within:border-zinc-500 transition-colors"
      >
        <FiSearch className="text-zinc-500 mr-2 shrink-0" />
        <input 
          type="text" 
          name="q"
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search uniform codes, categories..." 
          className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-zinc-500 focus:ring-0"
        />
      </form>

      <div className="flex items-center space-x-5 md:space-x-6">
        <Link to="/cart" className="relative text-zinc-400 hover:text-white transition-colors hidden md:block" title="Shopping Cart">
          <FiShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        <button className="text-zinc-400 hover:text-white transition-colors hidden sm:block" title="Notifications">
          <FiBell size={20} />
        </button>
        
        {user ? (
          <div className="flex items-center space-x-3 md:space-x-4">
            <span className="text-sm font-semibold text-zinc-300 hidden sm:block">
              Hi, {user.name.split(' ')[0]}
            </span>
            
            <Link 
              to={user.role === 'admin' ? '/profile' : '/user-profile'} 
              className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors overflow-hidden"
              title="My Profile"
            >
              {user.profilePicture ? (
                <img src={`http://localhost:5000${user.profilePicture}`} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <FiUser className="text-white" />
              )}
            </Link>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="text-sm font-semibold bg-white text-black px-4 md:px-5 py-2 rounded hover:bg-zinc-200 transition-colors shadow-lg"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;