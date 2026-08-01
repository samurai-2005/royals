import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiTag, FiShoppingBag, FiUser } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const MobileBottomNav = () => {
  const { cartCount } = useCart();
  useLocation(); // Subscribes to route changes to re-evaluate user profile state

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

  const navItems = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/catalog', label: 'Catalog', icon: FiGrid },
    { path: '/deals', label: 'Deals', icon: FiTag },
    { path: '/cart', label: 'Cart', icon: FiShoppingBag, badge: cartCount },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f0f]/95 backdrop-blur-lg border-t border-zinc-800 z-50 px-2 py-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors relative ${
                  isActive ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`
              }
            >
              <div className="relative">
                <Icon size={20} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
            </NavLink>
          );
        })}

        {/* Bottom-Right Profile Avatar Nav Button */}
        <NavLink
          to={user ? "/user-profile" : "/login"}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
              isActive ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`
          }
        >
          {user?.profilePicture ? (
            <img 
              src={getImageUrl(user.profilePicture)} 
              alt={user.name || "Profile"} 
              className="w-5 h-5 rounded-full object-cover border border-amber-500/60" 
            />
          ) : (
            <FiUser size={20} />
          )}
          <span className="text-[10px] mt-1">
            {user ? 'Profile' : 'Account'}
          </span>
        </NavLink>
      </div>
    </div>
  );
};

export default MobileBottomNav;