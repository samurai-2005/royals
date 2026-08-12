import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';

const MainLayout = () => {
  const location = useLocation();

  // Pages that should be full-width without ANY sidebars
  const isStandalonePage = 
    location.pathname.startsWith('/contact') ||
    location.pathname.includes('policy') ||
    location.pathname.includes('terms');

  const hideLeftSidebar = isStandalonePage;

  // Pages that hide right sidebar (Includes Admin Dashboard)
  const hideRightSidebar = 
    location.pathname.startsWith('/profile') || 
    location.pathname.startsWith('/user-profile') || 
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/admin') ||
    isStandalonePage;

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-white overflow-hidden pb-[76px] md:pb-0">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Shell */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar (Desktop) */}
        {!hideLeftSidebar && (
          <div className="hidden md:block">
            <LeftSidebar />
          </div>
        )}

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto bg-[#0f0f0f] p-4 md:p-8 relative scrollbar-hide flex flex-col min-h-full">
          <div className="flex-1 w-full max-w-5xl mx-auto">
            <Outlet /> 
          </div>

          {/* Footer */}
          <Footer />
        </main>

        {/* Right Sidebar (Desktop) */}
        {!hideRightSidebar && (
          <div className="hidden lg:block">
            <RightSidebar />
          </div>
        )}
        
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />

    </div>
  );
};

export default MainLayout;