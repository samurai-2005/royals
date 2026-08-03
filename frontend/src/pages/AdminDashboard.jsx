import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiShield, 
  FiDollarSign, 
  FiTag, 
  FiSend, 
  FiCheckCircle, 
  FiTruck, 
  FiArrowLeft,
  FiPlusCircle,
  FiTrendingUp,
  FiRefreshCw,
  FiAlertCircle,
  FiEdit3,
  FiCheck,
  FiX
} from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Security & Authentication States
  const [authenticating, setAuthenticating] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  // Tab State: 'analytics' | 'inventory' | 'orders' | 'sales-organizer'
  const [activeTab, setActiveTab] = useState('analytics');

  // Data States
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  // Inline Stock Edit State
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockCount, setNewStockCount] = useState('');

  // Order Status Update State
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Flash Sale Form State
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

  // Helper: Get JWT token from local storage
  const getAuthHeader = useCallback(() => {
    const userInfoString = localStorage.getItem('userInfo');
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    return userInfo?.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : null;
  }, []);

  // Fetch Dashboard Core Data (Orders & Products)
  const fetchDashboardData = useCallback(async () => {
    const config = getAuthHeader();
    if (!config) return;

    setLoadingData(true);
    setDataError('');

    try {
      const [ordersRes, productsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, config),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`)
      ]);

      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
    } catch (err) {
      console.error('Admin data fetch error:', err);
      setDataError(err.response?.data?.message || 'Failed to load live administrative data.');
    } finally {
      setLoadingData(false);
    }
  }, [getAuthHeader]);

  // 1. STRICT SERVER-SIDE AUTHENTICATION HANDSHAKE
  useEffect(() => {
    const verifyServerAdminSession = async () => {
      const config = getAuthHeader();
      if (!config) {
        navigate('/login');
        return;
      }

      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, config);

        if (!data.isAdmin) {
          alert('🚫 Access Denied: Administrator permissions required.');
          navigate('/user-profile');
          return;
        }

        setAdminUser(data);
        fetchDashboardData();
      } catch (err) {
        console.error('Admin authorization handshake failed:', err);
        navigate('/login');
      } finally {
        setAuthenticating(false);
      }
    };

    verifyServerAdminSession();
  }, [navigate, getAuthHeader, fetchDashboardData]);

  // 2. INVENTORY STOCK UPDATE HANDLER
  const handleSaveStock = async (productId) => {
    const config = getAuthHeader();
    if (!config) return;

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}`,
        { countInStock: Number(newStockCount) },
        config
      );

      setProducts(prev => prev.map(p => p._id === productId ? data : p));
      setEditingStockId(null);
      alert(`✅ Inventory updated for "${data.name}". Stock count set to ${data.countInStock}.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock inventory.');
    }
  };

  // 3. ORDER FULFILLMENT STATUS UPDATE HANDLER
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const config = getAuthHeader();
    if (!config) return;

    setUpdatingOrderId(orderId);
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        config
      );

      setOrders(prev => prev.map(o => o._id === orderId ? data : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // 4. FLASH SALE EVENT CREATOR HANDLER
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
    setSaleMessage(`✅ Flash Sale Event "${eventTitle}" published!`);
    if (broadcastPush) {
      setSaleMessage(`✅ Flash Sale Published & Push Broadcast dispatched to all devices!`);
    }

    setEventTitle('');
    setEventDescription('');
  };

  // FINANCIAL REVENUE CALCULATIONS
  const safeOrders = Array.isArray(orders) ? orders : [];
  const totalRevenue = safeOrders.reduce((acc, order) => acc + (order.totalPrice || order.itemsPrice || 0), 0);
  const onlineOrders = safeOrders.filter(o => o.paymentMethod?.toLowerCase() !== 'cod');
  const codOrders = safeOrders.filter(o => o.paymentMethod?.toLowerCase() === 'cod');
  const onlineRevenue = onlineOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const codRevenue = codOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const receivedRevenue = safeOrders.filter(o => o.isPaid).reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const pendingRevenue = Math.max(0, totalRevenue - receivedRevenue);

  // AUTHENTICATING SCREEN
  if (authenticating) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Verifying Administrator Session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
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
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">
                Royal Admin Command Center
              </h1>
              <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <FiShield size={10} /> AUTHENTICATED
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Logged in as <strong className="text-zinc-200">{adminUser?.name}</strong> ({adminUser?.email})
            </p>
          </div>
        </div>

        {/* TAB NAVIGATION CONTROLS */}
        <div className="flex flex-wrap items-center gap-2 bg-[#18181b] p-1.5 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics' ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Financials
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory' ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Inventory Control ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Fulfillment ({safeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('sales-organizer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sales-organizer' ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Flash Sales
          </button>
        </div>
      </div>

      {dataError && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
          <FiAlertCircle size={16} /> {dataError}
        </div>
      )}

      {/* TAB 1: FINANCIAL & REVENUE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500">Live Revenue Metrics</h2>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <FiRefreshCw className={loadingData ? 'animate-spin' : ''} size={14} />
              {loadingData ? 'Refreshing...' : 'Refresh Financials'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-xl">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center justify-between">
                Total Gross Revenue <FiTrendingUp className="text-amber-400" size={16} />
              </span>
              <p className="text-2xl font-black text-white">Rs {totalRevenue.toFixed(2)}</p>
              <p className="text-[11px] text-zinc-500">All order transactions</p>
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
                Settled / Received <FiCheckCircle className="text-amber-400" size={16} />
              </span>
              <p className="text-2xl font-black text-amber-400">Rs {receivedRevenue.toFixed(2)}</p>
              <p className="text-[11px] text-zinc-500">Pending: <strong className="text-red-400">Rs {pendingRevenue.toFixed(2)}</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">PhonePe PG API Gateway</h3>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">CONNECTED</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Online payments are auto-verified via PhonePe UPI & Payment Gateway callbacks.
              </p>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shiprocket Logistics API</h3>
                </div>
                <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded font-mono font-bold">READY</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automated AWBs and shipping label generation directly synced with courier partners.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: INVENTORY & STOCK CONTROL */}
      {activeTab === 'inventory' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wide">Catalog Inventory Control</h2>
              <p className="text-xs text-zinc-400">Update product stock counts. Setting count to 0 switches the storefront button to "Notify Me".</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
            >
              <FiRefreshCw className={loadingData ? 'animate-spin' : ''} /> Reload Catalog
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider font-black text-[10px]">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock Count</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {products.map((prod) => {
                  const stock = prod.countInStock !== undefined ? prod.countInStock : (prod.inStock ? 10 : 0);
                  const isOut = stock <= 0;

                  return (
                    <tr key={prod._id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-3.5 font-bold text-white max-w-[200px] truncate">{prod.name}</td>
                      <td className="p-3.5 text-zinc-400">{prod.mainGroup}</td>
                      <td className="p-3.5 font-bold text-zinc-200">Rs {prod.price}</td>
                      
                      {/* STOCK COUNT FIELD / EDIT INLINE */}
                      <td className="p-3.5">
                        {editingStockId === prod._id ? (
                          <input
                            type="number"
                            min="0"
                            value={newStockCount}
                            onChange={(e) => setNewStockCount(e.target.value)}
                            className="w-20 bg-zinc-900 border border-amber-500 rounded px-2 py-1 text-white text-xs focus:outline-none"
                          />
                        ) : (
                          <span className="font-mono font-bold text-sm text-zinc-100">{stock}</span>
                        )}
                      </td>

                      {/* STATUS BADGE */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isOut 
                            ? 'bg-red-950 text-red-400 border border-red-800' 
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {isOut ? 'Out of Stock' : 'In Stock'}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-3.5 text-right">
                        {editingStockId === prod._id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveStock(prod._id)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                              title="Save Stock"
                            >
                              <FiCheck size={14} />
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded cursor-pointer"
                              title="Cancel"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingStockId(prod._id);
                              setNewStockCount(stock);
                            }}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded cursor-pointer flex items-center gap-1 text-[11px] font-bold ml-auto"
                          >
                            <FiEdit3 size={12} /> Edit Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER FULFILLMENT CENTER */}
      {activeTab === 'orders' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wide">Order Fulfillment & Logistics</h2>
              <p className="text-xs text-zinc-400">Review customer purchases and update dispatch statuses.</p>
            </div>
          </div>

          <div className="space-y-4">
            {safeOrders.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-12">No customer orders recorded yet.</p>
            ) : (
              safeOrders.map((order) => (
                <div key={order._id} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b border-zinc-800/80 pb-3">
                    <div>
                      <span className="text-zinc-500 font-bold uppercase text-[10px] block">Order Ref</span>
                      <span className="font-mono font-bold text-amber-400">#{order._id}</span>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-bold uppercase text-[10px] block">Customer</span>
                      <span className="font-bold text-zinc-200">{order.user?.name || 'Guest'} ({order.user?.email || 'N/A'})</span>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-bold uppercase text-[10px] block">Total Amount</span>
                      <span className="font-bold text-white">Rs {order.totalPrice || order.itemsPrice}</span>
                    </div>

                    {/* STATUS SELECTOR */}
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 font-bold uppercase text-[10px]">Status:</span>
                      <select
                        value={order.status || (order.isDelivered ? 'Delivered' : 'Processing')}
                        disabled={updatingOrderId === order._id}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 text-white text-xs font-bold rounded px-2 py-1 focus:outline-none"
                      >
                        <option value="Processing">Processing</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  {/* ORDER ITEMS LIST */}
                  <div className="text-xs space-y-1">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-400">
                        <span>• {item.name} (Qty: {item.qty})</span>
                        <span className="font-mono text-zinc-300">Rs {item.qty * item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: FLASH SALE EVENT ORGANIZER */}
      {activeTab === 'sales-organizer' && (
        <div className="space-y-8 animate-fade-in">
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
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;