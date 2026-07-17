import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiBell, FiUser, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const navigate = useNavigate();
  
  // useLocation triggers a component re-render every time the URL changes
useLocation();
  // Derive the user directly during the render. 
  // No useState or useEffect needed, which fixes the ESLint warning!
  const userInfoString = localStorage.getItem('userInfo');
  const user = userInfoString ? JSON.parse(userInfoString) : null;

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <nav className="h-16 bg-[#0f0f0f] border-b border-zinc-800 flex items-center justify-between px-6 shrink-0">
      
      {/* Brand / Logo */}
      <Link to="/" className="text-xl font-bold tracking-wide text-white hover:text-zinc-300 transition-colors">
        The Royal Tailor
      </Link>

      {/* Central Search Bar */}
      <div className="hidden md:flex items-center bg-zinc-900 rounded-full px-4 py-2 w-1/3 max-w-md border border-zinc-800 focus-within:border-zinc-500 transition-colors">
        <FiSearch className="text-zinc-500 mr-2" />
        <input 
          type="text" 
          placeholder="Search uniform codes, categories..." 
          className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-zinc-500 focus:ring-0"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-6">
        <button className="text-zinc-400 hover:text-white transition-colors" title="Notifications">
          <FiBell size={20} />
        </button>
        
        {/* Conditional Rendering: Profile UI OR Login Button */}
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-zinc-300 hidden sm:block">
              Hi, {user.name.split(' ')[0]}
            </span>
            
            {/* Dynamic Profile Routing based on Role */}
            <Link 
              to={user.role === 'admin' ? '/profile' : '/user-profile'} 
              className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors"
              title="My Profile / Dashboard"
            >
              <FiUser className="text-white" />
            </Link>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-400 transition-colors ml-2"
              title="Logout"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="text-sm font-semibold bg-white text-black px-5 py-2 rounded hover:bg-zinc-200 transition-colors shadow-lg"
          >
            Login
          </Link>
        )}
      </div>
      
    </nav>
  );
};

export default Navbar;