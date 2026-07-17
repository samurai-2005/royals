import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Top Navigation - Fixed at the top */}
      <Navbar />

      {/* Main Content Area - Below Navbar */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Static */}
        <aside className="w-64 bg-[#0f0f0f] border-r border-zinc-800 hidden md:flex flex-col overflow-y-auto">
          <LeftSidebar />
        </aside>

        {/* Dynamic Central Core - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-6 shadow-inner">
          {/* Outlet swaps components based on the current route */}
          <Outlet /> 
        </main>

        {/* Right Sidebar - Static */}
        <aside className="w-72 bg-[#0f0f0f] border-l border-zinc-800 hidden lg:flex flex-col overflow-y-auto p-4">
          <RightSidebar />
        </aside>
        
      </div>
    </div>
  );
};

export default MainLayout;