import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiShoppingBag, FiTag, FiUser } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();

  const navs = [
    { path: '/', label: 'Home', icon: <FiHome size={18} /> },
    { path: '/catalog', label: 'Catalog', icon: <FiGrid size={18} /> },
    { path: '/deals', label: 'Deals', icon: <FiTag size={18} /> },
    { 
      path: '/cart', 
      label: 'Cart', 
      icon: (
        <div className="relative">
          <FiShoppingBag size={18} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
      ) 
    },
    { path: '/user-profile', label: 'Account', icon: <FiUser size={18} /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-zinc-800 z-40 px-2 py-2">
      <div className="flex justify-around items-center">
        {navs.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
                isActive ? 'text-white' : 'text-zinc-500'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;