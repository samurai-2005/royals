import { useState, useEffect } from 'react';
import { FiDownload, FiX, FiShare } from 'react-icons/fi';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // 1. Evaluate iOS device check directly during state initialization
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });

  // 2. Evaluate initial prompt visibility directly during state initialization
  const [showPrompt, setShowPrompt] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return false;

    const iosDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (iosDevice) {
      const dismissed = localStorage.getItem('pwa_ios_dismissed');
      return !dismissed;
    }
    return false;
  });

  // 3. Listen exclusively for the external beforeinstallprompt browser event
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('pwa_ios_dismissed', 'true');
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 bg-[#18181b] border border-zinc-700 p-4 rounded-2xl shadow-2xl max-w-sm text-white animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="w-12 h-12 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center flex-shrink-0">
          <img 
            src="/icon-192.png" 
            alt="App Logo" 
            className="w-full h-full object-cover rounded-xl" 
            onError={(e) => { e.target.style.display = 'none'; }} 
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm">Install The Royal Tailor</h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isIOS 
              ? 'Tap Share below and choose "Add to Home Screen" for the full app experience.' 
              : 'Add our official web app to your home screen for quick orders.'}
          </p>
        </div>

        <button onClick={handleDismiss} className="text-zinc-500 hover:text-white p-1">
          <FiX size={16} />
        </button>
      </div>

      {!isIOS ? (
        <button
          onClick={handleInstallClick}
          className="w-full mt-3 bg-white text-black font-bold py-2.5 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 text-xs"
        >
          <FiDownload size={14} /> Install Web App
        </button>
      ) : (
        <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-semibold">
          <FiShare size={14} className="text-blue-400" /> Tap Share → Add to Home Screen
        </div>
      )}
    </div>
  );
};

export default PWAInstallPrompt;