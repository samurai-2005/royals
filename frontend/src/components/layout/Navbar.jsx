import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX, FiBell } from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../../context/CartContext';

const Navbar = ({ toggleSidebar }) => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  useLocation(); // Subscribes to route changes to re-evaluate user profile state
  const { cartCount } = useCart();

  // Derived user state directly from localStorage
  const getUser = () => {
    try {
      const userInfoString = localStorage.getItem('userInfo');
      return userInfoString ? JSON.parse(userInfoString) : null;
    } catch {
      return null;
    }
  };

  const user = getUser();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword.trim()}`);
    }
  };

  // Notification Bell Click Handler
  const handleNotificationBellClick = async () => {
    if (!('Notification' in window)) {
      alert('Push notifications are not supported on this browser.');
      return;
    }

    if (Notification.permission === 'granted') {
      alert('🔔 Royal Notifications are ACTIVE! You will receive order updates & sales alerts.');
      return;
    }

    if (Notification.permission === 'denied') {
      alert('⚠️ Notifications are blocked in your browser settings. Please enable notifications for royaltailors.net to receive order updates.');
      return;
    }

    // Request permission if default
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const publicVapidKey = import.meta.env.VITE_PUBLIC_VAPID_KEY;

        if (publicVapidKey) {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicVapidKey
          });

          const userInfo = getUser();
          const config = userInfo?.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};

          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/users/subscribe-push`,
            { subscription },
            config
          );
        }

        alert('✅ Royal Notifications successfully enabled!');
      }
    } catch (err) {
      console.error('Failed to enable notifications:', err);
    }
  };

  return (
    <header className="bg-[#0f0f0f] border-b border-zinc-800 sticky top-0 z-40 px-4 py-3 w-full">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        
        {/* TOP ROW: Brand Name & Action Icons */}
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

          {/* Desktop Search Bar */}
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

          {/* Actions: Notification Bell + Cart + User Profile Avatar */}
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={handleNotificationBellClick}
              className="relative text-zinc-300 hover:text-white transition-colors p-1 cursor-pointer" 
              aria-label="Notifications"
              title="Notifications"
            >
              <FiBell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            </button>

            <Link to="/cart" className="relative text-zinc-300 hover:text-white transition-colors p-1">
              <FiShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Desktop User Avatar / Account Badge */}
            <Link 
              to={user ? "/user-profile" : "/login"} 
              className="hidden md:flex items-center gap-2.5 text-zinc-300 hover:text-white text-xs font-bold transition-colors bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-full"
            >
              {user?.profilePicture ? (
                <img 
                  src={getImageUrl(user.profilePicture)} 
                  alt={user.name || "Profile"} 
                  className="w-6 h-6 rounded-full object-cover border border-amber-500/50" 
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                  <FiUser size={13} className="text-zinc-300" />
                </div>
              )}
              <span className="truncate max-w-[100px]">
                {user ? user.name.split(' ')[0] : 'Account'}
              </span>
            </Link>
          </div>
        </div>

        {/* MOBILE SEARCH BAR */}
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