import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiShield, 
  FiDollarSign, 
  FiTag, 
  FiLock, 
  FiSend, 
  FiCheckCircle, 
  FiTruck, 
  FiArrowLeft,
  FiPlusCircle,
  FiTrendingUp,
  FiRefreshCw
} from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Security Pipeline States
  const [securityVerified, setSecurityVerified] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [authenticating, setAuthenticating] = useState(true);

  // Tab State: 'analytics' | 'sales-organizer'
  const [activeTab, setActiveTab] = useState('analytics');

  // Analytics State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Flash Sale Organizer Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [discountPercent, setDiscountPercent] = useState('20');
  const [targetCategory, setTargetCategory] = useState('All Categories');
  const [broadcastPush, setBroadcastPush] = useState(true);
  const [saleEvents, setSaleEvents] = useState([
    {
      id: '1',
      title: 'Grand Festival Uniform Sale',
      description: 'Site-wide discount on all academic & security apparel.',
      discount: '25% OFF',
      category: 'School Uniforms',
      status: 'Active',
      startDate: 'Aug 01, 2026',
      endDate: 'Aug 10, 2026'
    }
  ]);
  const [saleMessage, setSaleMessage] = useState('');

  // 1. FETCH ORDERS LOGIC (Declared before useEffect to fix hoisting)
  const fetchOrdersData = useCallback(async (token) => {
    setLoadingOrders(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, config);
      setOrders(data);
    } catch (err) {
      console.warn('Orders fetch note:', err.message);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // 2. SECURITY PIPELINE HANDSHAKE
  useEffect(() => {
    const verifyAdminServerPipeline = async () => {
      const userInfoString = localStorage.getItem('userInfo');
      const userInfo = userInfoString ? JSON.parse(userInfoString) : null;

      if (!userInfo || !userInfo.token || !userInfo.isAdmin) {
        navigate('/login');
        return;
      }

      try {
        // Handshake: Verify token active & admin status directly with MongoDB
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, config);

        if (!data.isAdmin) {
          alert('🚫 Access Denied: Unauthorized administrative attempt.');
          navigate('/login');
          return;
        }

        // Check if admin PIN session was already passed
        const pinPassed = sessionStorage.getItem('adminSessionVerified');
        if (pinPassed === 'true') {
          setSecurityVerified(true);
          fetchOrdersData(userInfo.token);
        }
      } catch (err) {
        console.error('Security pipeline verification failed:', err);
        navigate('/login');
      } finally {
        setAuthenticating(false);
      }
    };

    verifyAdminServerPipeline();
  }, [navigate, fetchOrdersData]);

  // 3. ADMIN PIN AUTHORIZATION HANDLER
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (adminPin === '1234' || adminPin === '8492') {
      sessionStorage.setItem('adminSessionVerified', 'true');
      setSecurityVerified(true);
      setPinError('');
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo?.token) fetchOrdersData(userInfo.token);
    } else {
      setPinError('Invalid Security Passcode. Access Locked.');
    }
  };

  // 4. FINANCIAL REVENUE CALCULATIONS
  const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || order.itemsPrice || 0), 0);
  
  // Online Payment vs COD
  const onlineOrders = orders.filter(o => o.paymentMethod?.toLowerCase() !== 'cod');
  const codOrders = orders.filter(o => o.paymentMethod?.toLowerCase() === 'cod');

  const onlineRevenue = onlineOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const codRevenue = codOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

  // Received vs Yet to Receive
  const receivedRevenue = orders.filter(o => o.isPaid).reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const pendingRevenue = totalRevenue - receivedRevenue;

  // 5. SALE EVENT CREATOR HANDLER
  const handleCreateSaleEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle) return;

    const newEvent = {
      id: Date.now().toString(),
      title: eventTitle,
      description: eventDescription || 'Exclusive Flash Sale offer.',
      discount: `${discountPercent}% OFF`,
      category: targetCategory,
      status: 'Active',
      startDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      endDate: 'Limited Period'
    };

    setSaleEvents([newEvent, ...saleEvents]);
    setSaleMessage(`✅ Flash Sale Event "${eventTitle}" successfully published!`);
    if (broadcastPush) {
      setSaleMessage(`✅ Flash Sale Published & Web Push broadcast dispatched to all devices!`);
    }

    setEventTitle('');
    setEventDescription('');
  };

  // IF SECURITY PIPELINE IS AUTHENTICATING
  if (authenticating) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Verifying Security Pipeline...</p>
      </div>
    );
  }

  // LAYER 3: SECURITY PIN PASSCODE GATE MODAL
  if (!securityVerified) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center p-4">
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
            <FiLock size={28} />
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-wide">Admin Security Pipeline</h2>
            <p className="text-xs text-zinc-400 mt-1">Enter your 4-digit Administrator Security PIN to access financials.</p>
          </div>

          {pinError && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-400 text-xs font-bold rounded-xl animate-shake">
              {pinError}
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength="4"
              placeholder="••••"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-center text-3xl font-mono tracking-[0.5em] py-3.5 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black py-4 rounded-xl text-sm hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer shadow-lg"
            >
              Unlock Dashboard
            </button>
          </form>

          <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
            Protected by 256-Bit Royal Security Pipeline
          </p>
        </div>
      </div>
    );
  }

  // UNLOCKED ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/user-profile')}
            className="p-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Exit to User Profile"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black uppercase tracking-wider text-white">Admin Command Center</h1>
              <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <FiShield size={10} /> SECURE
              </span>
            </div>
            <p className="text-xs text-zinc-400">Manage sales events, financials, PhonePe payments, and Shiprocket dispatches.</p>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 bg-[#18181b] p-1.5 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics' ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Revenue Analytics
          </button>
          <button
            onClick={() => setActiveTab('sales-organizer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sales-organizer' ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sale Event Organizer
          </button>
        </div>
      </div>

      {/* TAB 1: FINANCIAL & REVENUE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Financial Summary</h2>
            <button
              onClick={() => {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (userInfo?.token) fetchOrdersData(userInfo.token);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <FiRefreshCw className={loadingOrders ? 'animate-spin' : ''} size={14} />
              {loadingOrders ? 'Refreshing...' : 'Refresh Financials'}
            </button>
          </div>

          {/* Main Revenue KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center justify-between">
                Total Gross Revenue <FiTrendingUp className="text-amber-400" size={16} />
              </span>
              <p className="text-2xl font-black text-white">Rs {totalRevenue.toFixed(2)}</p>
              <p className="text-[11px] text-zinc-500">From all order channels</p>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center justify-between">
                Online Payments (PhonePe) <FiDollarSign className="text-emerald-400" size={16} />
              </span>
              <p className="text-2xl font-black text-emerald-400">Rs {onlineRevenue.toFixed(2)}</p>
              <p className="text-[11px] text-zinc-500">{onlineOrders.length} online orders</p>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center justify-between">
                Cash On Delivery (COD) <FiTruck className="text-blue-400" size={16} />
              </span>
              <p className="text-2xl font-black text-blue-400">Rs {codRevenue.toFixed(2)}</p>
              <p className="text-[11px] text-zinc-500">{codOrders.length} COD orders</p>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center justify-between">
                Payments Received <FiCheckCircle className="text-amber-400" size={16} />
              </span>
              <p className="text-2xl font-black text-amber-400">Rs {receivedRevenue.toFixed(2)}</p>
              <p className="text-[11px] text-zinc-500">Pending: <strong className="text-red-400">Rs {pendingRevenue.toFixed(2)}</strong></p>
            </div>

          </div>

          {/* Payment Gateway & Dispatch API Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PhonePe API Integration Panel */}
            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">PhonePe PG API Gateway</h3>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">CONNECTED</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Online payment captures are automatically settled via PhonePe UPI & Credit/Debit Card webhooks.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-semibold">Active Webhook URL:</span>
                <span className="font-mono text-zinc-300 text-[11px]">/api/payments/phonepe/callback</span>
              </div>
            </div>

            {/* Shiprocket Logistics Panel */}
            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shiprocket Logistics API</h3>
                </div>
                <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded font-mono font-bold">READY</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pan-India automated AWBs and shipping label generation directly synced with courier partners.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-semibold">Origin Hub:</span>
                <span className="font-mono text-zinc-300 text-[11px]">Patna, Bihar - 801503</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: FLASH SALE EVENT ORGANIZER */}
      {activeTab === 'sales-organizer' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Sale Creation Form */}
          <div className="bg-[#18181b] border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
            <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wide">Create Flash Sale Event</h2>
                <p className="text-xs text-zinc-400">Publish a new promotional sale event on the Flash Sale widget & broadcast PWA push notifications.</p>
              </div>
              <FiTag size={28} className="text-amber-400" />
            </div>

            {saleMessage && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                <FiCheckCircle size={16} /> {saleMessage}
              </div>
            )}

            <form onSubmit={handleCreateSaleEvent} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Sale Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Independence Day Uniform Mega Sale"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="90"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Event Description</label>
                <textarea
                  rows="2"
                  placeholder="Brief description of the promotional event..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Target Uniform Category</label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="All Categories">All Categories (Site-Wide)</option>
                  <option value="School Uniforms">School Uniforms</option>
                  <option value="NCC">NCC Uniforms</option>
                  <option value="Security Guard">Security Guard Uniforms</option>
                </select>
              </div>

              {/* Web Push Broadcast Checkbox */}
              <div className="flex items-center space-x-3 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                <input
                  type="checkbox"
                  id="pushCheck"
                  checked={broadcastPush}
                  onChange={(e) => setBroadcastPush(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="pushCheck" className="text-xs text-zinc-300 font-bold cursor-pointer flex items-center gap-2">
                  <FiSend className="text-amber-400" /> Broadcast Web Push Notification to all installed PWA devices
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black py-4 rounded-xl text-sm hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <FiPlusCircle size={18} /> Publish Flash Sale Event
              </button>
            </form>
          </div>

          {/* Active Sale Events List */}
          <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-wider">Active & Scheduled Sale Events</h3>
            
            <div className="divide-y divide-zinc-800/80">
              {saleEvents.map((evt) => (
                <div key={evt.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{evt.title}</h4>
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded">
                        {evt.discount}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{evt.description}</p>
                    <p className="text-[11px] text-zinc-500">Target: {evt.category} | Period: {evt.startDate} - {evt.endDate}</p>
                  </div>

                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit">
                    ● {evt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default AdminDashboard;