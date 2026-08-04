import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  FiSearch, 
  FiShoppingBag, 
  FiUser, 
  FiMenu, 
  FiX, 
  FiBell, 
  FiPackage, 
  FiTag, 
  FiCheck, 
  FiAlertCircle,
  FiChevronRight
} from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../../context/CartContext';

const Navbar = ({ toggleSidebar }) => {
  const [keyword, setKeyword] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [expiredBanner, setExpiredBanner] = useState(null);
  const [notifications, setNotifications] = useState([]); // Array bound to MongoDB
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  useLocation(); 
  const { cartCount } = useCart();

  const getUser = useCallback(() => {
    try {
      const userInfoString = localStorage.getItem('userInfo');
      return userInfoString ? JSON.parse(userInfoString) : null;
    } catch {
      return null;
    }
  }, []);

  const user = getUser();
  const userToken = user?.token; // Extract token as a primitive string
  const unreadCount = notifications.filter(n => !n.read).length;

  // 🔔 Fetch Live Notifications from Database
  useEffect(() => {
    if (userToken) {
      const fetchNotifications = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${userToken}` } };
          const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/notifications`, config);
          setNotifications(data || []);
        } catch (err) {
          console.error("Failed to fetch notifications", err);
        }
      };

      fetchNotifications();
      // Poll every 30 seconds for live updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userToken]); // <-- Perfectly clean dependency array

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // Helper: Format Database timestamp to "10m ago"
  const formatTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
        setExpiredBanner(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword.trim()}`);
    }
  };

  // Mark single notification read
  const handleNotificationClick = async (notif) => {
    setExpiredBanner(null);

    // Optimistic UI Update
    setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));

    // Update DB securely
    if (userToken) {
      try {
        const config = { headers: { Authorization: `Bearer ${userToken}` } };
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/notifications/${notif._id}/read`, {}, config);
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }

    if (notif.type === 'sale' && notif.isExpired) {
      setExpiredBanner(`⚠️ The sale event "${notif.title}" has expired!`);
      return;
    }

    if (notif.targetUrl) {
      setShowNotifications(false);
      navigate(notif.targetUrl);
    }
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    if (!userToken) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userToken}` } };
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/notifications/read-all`, {}, config);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnablePushPermissions = async () => {
    if (!('Notification' in window)) return;
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

          const config = userToken ? { headers: { Authorization: `Bearer ${userToken}` } } : {};
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/users/subscribe-push`,
            { subscription },
            config
          );
        }
      }
    } catch (err) {
      console.error('Push permission error:', err);
    }
  };

  return (
    <header className="bg-[#0f0f0f] border-b border-zinc-800 sticky top-0 z-40 px-4 py-3 w-full">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        
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

          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            
            <button 
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setExpiredBanner(null);
              }}
              className="relative text-zinc-300 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-zinc-900 cursor-pointer" 
              aria-label="Notifications"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0f0f0f] animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-left animate-fade-in backdrop-blur-xl">
                
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Royal Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} New
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <FiCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>

                {expiredBanner && (
                  <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2.5 text-[11px] font-bold text-amber-300 flex items-center gap-2 animate-shake">
                    <FiAlertCircle size={14} className="flex-shrink-0 text-amber-400" />
                    <span>{expiredBanner}</span>
                  </div>
                )}

                <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60 scrollbar-hide">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-xs">
                      No notifications right now.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 transition-colors cursor-pointer flex items-start space-x-3 group relative ${
                          !notif.read ? 'bg-zinc-900/80 hover:bg-zinc-900' : 'hover:bg-zinc-900/40 opacity-75'
                        }`}
                      >
                        {!notif.read && (
                          <div className="absolute left-0 top-3 bottom-3 w-1 bg-amber-500 rounded-r" />
                        )}

                        <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                          notif.type === 'order' 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {notif.type === 'order' ? <FiPackage size={16} /> : <FiTag size={16} />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-zinc-500 flex-shrink-0">
                              {formatTimeAgo(notif.createdAt)}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-400 leading-snug mt-1 line-clamp-2">
                            {notif.message}
                          </p>

                          {notif.isExpired && (
                            <span className="inline-block mt-1.5 text-[9px] font-black uppercase tracking-wider text-red-400 bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded">
                              Sale Expired
                            </span>
                          )}
                        </div>

                        <FiChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-300 transition-colors flex-shrink-0 self-center" />
                      </div>
                    ))
                  )}
                </div>

                {'Notification' in window && Notification.permission === 'default' && (
                  <div className="p-3 bg-zinc-900 border-t border-zinc-800 text-center">
                    <button
                      onClick={handleEnablePushPermissions}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      Enable Browser Push Notifications →
                    </button>
                  </div>
                )}

              </div>
            )}

            <Link to="/cart" className="relative text-zinc-300 hover:text-white transition-colors p-1">
              <FiShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </Link>

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