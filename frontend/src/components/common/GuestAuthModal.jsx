import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUserCheck, FiLock, FiX } from 'react-icons/fi';

const GuestAuthModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    const isLoginPage = location.pathname === '/login';

    // Show auth prompt for guests navigating around the site (catalog, deals, product, cart)
    if (!userInfo && !isLoginPage) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500); // Pops up 1.5 seconds after landing/exploring

      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [location.pathname]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#18181b] border border-zinc-800 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl relative text-center text-white">
        
        {/* Dismiss Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
        >
          <FiX size={20} />
        </button>

        {/* Icon & Banner */}
        <div className="w-14 h-14 bg-white/10 border border-white/20 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiLock size={26} />
        </div>

        <h2 className="text-xl md:text-2xl font-black mb-2 tracking-tight">
          Welcome to The Royal Tailor
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-6">
          Sign in or create an account to view exclusive institutional pricing, save your sizing preferences, and track uniform orders.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/login');
            }}
            className="w-full bg-white text-black font-black py-3.5 rounded-xl hover:bg-zinc-200 transition-colors text-sm shadow-lg flex items-center justify-center gap-2"
          >
            <FiUserCheck size={18} /> Sign In / Register Now
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold py-2.5 rounded-xl transition-colors text-xs"
          >
            Continue Browsing as Guest
          </button>
        </div>

      </div>
    </div>
  );
};

export default GuestAuthModal;