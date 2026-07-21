import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileBottomNav from './MobileBottomNav';
import { FiBell } from 'react-icons/fi';

const MainLayout = () => {
  const location = useLocation();

  // Check the current URL to conditionally hide the right sidebar
  const hideRightSidebar = 
    location.pathname.startsWith('/profile') || 
    location.pathname.startsWith('/user-profile') || 
    location.pathname.startsWith('/checkout');

  // Helper function to extract and format the current page for the center indicator
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return '';
    if (path.includes('/category')) return 'Category';
    if (path.includes('/product')) return 'Product Detail';
    if (path === '/catalog') return 'Catalog';
    if (path === '/deals') return 'Offers & Deals';
    if (path === '/cart') return 'Shopping Cart';
    if (path === '/user-profile') return 'My Profile';
    if (path === '/settings') return 'Settings';
    if (path === '/profile') return 'Merchant Hub';
    if (path === '/checkout') return 'Checkout';
    return '';
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-white overflow-hidden pb-[76px] md:pb-0">
      
      {/* --- DESKTOP TOP NAV --- */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* --- MOBILE TOP NAV --- */}
      <div className="md:hidden flex justify-between items-center px-5 pt-4 pb-3 bg-[#0f0f0f] border-b border-zinc-900 z-40">
        {/* Left: Brand / Home Link */}
        <Link to="/" className="text-sm font-black tracking-wider text-white w-1/3">
          ROYAL TAILOR
        </Link>
        
        {/* Center: Dynamic Page Indicator */}
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center w-1/3">
          {getPageTitle()}
        </span>

        {/* Right: Notifications */}
        <div className="w-1/3 flex justify-end">
          <button className="text-white relative">
            <FiBell size={22} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f0f0f]"></span>
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT SHELL --- */}
      <div className="flex flex-1 overflow-hidden relative">
        
        <div className="hidden md:block">
          <LeftSidebar />
        </div>

        <main className="flex-1 overflow-y-auto bg-[#0f0f0f] p-0 md:p-6 relative scrollbar-hide">
          <Outlet /> 
        </main>

        {/* Conditionally render the Right Sidebar */}
        {!hideRightSidebar && (
          <div className="hidden lg:block">
            <RightSidebar />
          </div>
        )}
        
      </div>

      {/* --- MOBILE BOTTOM NAV --- */}
      <MobileBottomNav />

    </div>
  );
};

export default MainLayout;