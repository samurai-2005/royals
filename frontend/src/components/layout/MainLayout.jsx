import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileBottomNav from './MobileBottomNav';

const MainLayout = () => {
  const location = useLocation();

  // Hide right sidebar on specific workspace/profile routes
  const hideRightSidebar = 
    location.pathname.startsWith('/profile') || 
    location.pathname.startsWith('/user-profile') || 
    location.pathname.startsWith('/checkout');

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-white overflow-hidden pb-[76px] md:pb-0">
      
      {/* Top Nav (Handles both Mobile & PC responsive layouts) */}
      <Navbar />

      {/* Main Content Shell */}
      <div className="flex flex-1 overflow-hidden relative">
        
        <div className="hidden md:block">
          <LeftSidebar />
        </div>

        <main className="flex-1 overflow-y-auto bg-[#0f0f0f] p-0 md:p-6 relative scrollbar-hide">
          <Outlet /> 
        </main>

        {/* Conditionally render Right Sidebar */}
        {!hideRightSidebar && (
          <div className="hidden lg:block">
            <RightSidebar />
          </div>
        )}
        
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

    </div>
  );
};

export default MainLayout;