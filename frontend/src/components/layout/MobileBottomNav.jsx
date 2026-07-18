import { NavLink } from 'react-router-dom';
import { FiHome, FiGrid, FiTag, FiShoppingCart, FiUser } from 'react-icons/fi';

const MobileBottomNav = () => {
  return (
    // md:hidden ensures this entire bar completely vanishes on tablets and desktops
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#0f0f0f] border-t border-zinc-800 flex justify-between items-center px-6 py-4 z-50">
      
      <NavLink to="/" className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
        <FiHome size={22} />
        <span className="text-[10px] mt-1.5 font-medium">Home</span>
      </NavLink>
      
      <NavLink to="/catalog" className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
        <FiGrid size={22} />
        <span className="text-[10px] mt-1.5 font-medium">Catalog</span>
      </NavLink>

      <NavLink to="/deals" className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
        <FiTag size={22} />
        <span className="text-[10px] mt-1.5 font-medium">Deals</span>
      </NavLink>

      <NavLink to="/cart" className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
        <FiShoppingCart size={22} />
        <span className="text-[10px] mt-1.5 font-medium">Cart</span>
      </NavLink>

      <NavLink to="/user-profile" className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
        <FiUser size={22} />
        <span className="text-[10px] mt-1.5 font-medium">Profile</span>
      </NavLink>

    </div>
  );
};

export default MobileBottomNav;