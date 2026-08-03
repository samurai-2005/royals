import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiBell, FiX, FiCheck } from 'react-icons/fi';

const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if app is running as an installed PWA (Standalone Mode)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    // Only prompt if running in PWA mode AND permission hasn't been decided yet
    if (isPWA && 'Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // 3-second delay after launching PWA for a smooth experience

      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        
        // Public VAPID Key from backend env
        const publicVapidKey = import.meta.env.VITE_PUBLIC_VAPID_KEY;

        if (publicVapidKey) {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicVapidKey
          });

          // Send push subscription endpoint to backend
          const userInfo = JSON.parse(localStorage.getItem('userInfo'));
          const config = userInfo?.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};

          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/users/subscribe-push`,
            { subscription },
            config
          );
        }
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    } finally {
      setLoading(false);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-fade-in">
      <div className="bg-[#18181b] border border-amber-500/30 p-5 rounded-2xl shadow-2xl space-y-3 backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <FiBell size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Enable Royal Notifications</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">Get real-time order tracking & exclusive Flash Sales.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPrompt(false)} 
            className="text-zinc-500 hover:text-white p-1"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 hover:from-amber-400 hover:to-amber-500 cursor-pointer"
          >
            <FiCheck size={14} /> {loading ? 'Enabling...' : 'Allow Notifications'}
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="px-3 py-2.5 text-xs text-zinc-400 hover:text-white font-bold cursor-pointer"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;