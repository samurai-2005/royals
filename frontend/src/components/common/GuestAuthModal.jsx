import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiLock, FiX, FiMail, FiPhone, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const GuestAuthModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  // Official React pattern: Reset state during render when route changes
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    const isLoginPage = location.pathname === '/login';

    // Show auth prompt for unauthenticated users exploring site
    if (!userInfo && !isLoginPage) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#18181b] border border-zinc-800 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl relative text-center text-white space-y-5">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <FiX size={20} />
        </button>

        {/* Icon Header */}
        <div className="w-12 h-12 bg-white/10 border border-white/20 text-white rounded-2xl flex items-center justify-center mx-auto">
          <FiLock size={22} />
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight">Access Your Account</h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Sign in or register to access institutional uniform pricing, size tracking, and instant order updates.
          </p>
        </div>

        {/* Multi-Option Auth Stack */}
        <div className="space-y-3 pt-2">
          
          {/* Option 1: Google OAuth */}
          <button
            onClick={() => {
              setIsOpen(false);
              // Trigger Google OAuth route or login page with state
              navigate('/login', { state: { mode: 'google' } });
            }}
            className="w-full bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-3 cursor-pointer shadow-sm"
          >
            <FcGoogle size={18} /> Continue with Google
          </button>

          {/* Option 2: Phone / Email OTP Login */}
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/login', { state: { mode: 'otp' } });
            }}
            className="w-full bg-white text-black font-black py-3 rounded-xl hover:bg-zinc-200 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <FiPhone size={15} /> / <FiMail size={15} /> Sign In with Phone or Email OTP
          </button>

          {/* Option 3: Direct Signup */}
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/login', { state: { tab: 'signup' } });
            }}
            className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:text-white font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            New to Royal Tailor? Create Account <FiArrowRight size={14} />
          </button>

        </div>

        <p className="text-[10px] text-zinc-500 leading-snug">
          By signing in, you agree to our <a href="/terms-and-conditions" className="underline text-zinc-400">Terms</a> & <a href="/privacy-policy" className="underline text-zinc-400">Privacy Policy</a>.
        </p>

      </div>
    </div>
  );
};

export default GuestAuthModal;