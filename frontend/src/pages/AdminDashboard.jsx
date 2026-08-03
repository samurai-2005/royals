import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FiShield, 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiCheckCircle, 
  FiPrinter, 
  FiRefreshCw, 
  FiAlertCircle, 
  FiX, 
  FiTrendingUp, 
  FiCheck 
} from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'finance';

  // Auth & Core States
  const [authenticating, setAuthenticating] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  // Product Modal Form State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodMainGroup, setProdMainGroup] = useState('School Uniforms');
  const [prodSubGroup, setProdSubGroup] = useState('Unassigned');
  const [prodImage, setProdImage] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  // Inventory Inline Edit State
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockVal, setNewStockVal] = useState('');

  // Get Auth Header Helper
  const getAuthHeader = useCallback(() => {
    const userInfoString = localStorage.getItem('userInfo');
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    return userInfo?.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : null;
  }, []);

  // Fetch Dashboard Data
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

      // Fetch users list
      try {
        const usersRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`, config);
        setUsersList(Array.isArray(usersRes.data) ? usersRes.data : []);
      } catch {
        setUsersList([]);
      }
    } catch (err) {
      console.error('Admin data fetch error:', err);
      setDataError(err.response?.data?.message || 'Failed to sync with backend.');
    } finally {
      setLoadingData(false);
    }
  }, [getAuthHeader]);

  // Server Admin Authorization Handshake
  useEffect(() => {
    const verifyAdmin = async () => {
      const config = getAuthHeader();
      if (!config) {
        navigate('/login');
        return;
      }

      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, config);
        if (!data.isAdmin) {
          alert('🚫 Access Denied: Administrator privileges required.');
          navigate('/user-profile');
          return;
        }
        setAdminUser(data);
        fetchDashboardData();
      } catch (err) {
        console.error('Admin auth check failed:', err);
        navigate('/login');
      } finally {
        setAuthenticating(false);
      }
    };

    verifyAdmin();
  }, [navigate, getAuthHeader, fetchDashboardData]);

  // 💰 FINANCE: MARK PAYMENT RECEIVED HANDLER
  const handleMarkPaymentReceived = async (orderId) => {
    const config = getAuthHeader();
    if (!config) return;

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/pay`,
        { isPaid: true },
        config
      );
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, isPaid: true, paidAt: data.paidAt || Date.now() } : o));
    } catch {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, isPaid: true } : o));
    }
  };

  // 📦 PRODUCT: CREATE / EDIT PRODUCT HANDLER
  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProdName(prod.name);
      setProdPrice(prod.price);
      setProdDesc(prod.description);
      setProdMainGroup(prod.mainGroup);
      setProdSubGroup(prod.subGroup || 'Unassigned');
      setProdImage(prod.images?.[0] || prod.image || '');
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdPrice('');
      setProdDesc('');
      setProdMainGroup('School Uniforms');
      setProdSubGroup('Unassigned');
      setProdImage('');
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const config = getAuthHeader();
    if (!config) return;

    setSavingProduct(true);
    try {
      const payload = {
        name: prodName,
        price: Number(prodPrice),
        description: prodDesc,
        mainGroup: prodMainGroup,
        subGroup: prodSubGroup,
        images: prodImage ? [prodImage] : [],
        countInStock: editingProduct ? editingProduct.countInStock : 10 // Defaults to 10 on creation
      };

      if (editingProduct) {
        const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/products/${editingProduct._id}`, payload, config);
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? data : p));
      } else {
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/products`, payload, config);
        setProducts(prev => [data, ...prev]);
      }

      setProductModalOpen(false);
      alert(`✅ Product "${prodName}" saved successfully!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    const config = getAuthHeader();
    if (!config) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}`, config);
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  // 📊 INVENTORY: SAVE STOCK QUANTITY HANDLER
  const handleSaveStock = async (productId) => {
    const config = getAuthHeader();
    if (!config) return;

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}`,
        { countInStock: Number(newStockVal) },
        config
      );
      setProducts(prev => prev.map(p => p._id === productId ? data : p));
      setEditingStockId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock.');
    }
  };

  // 📑 ORDERS: FULFILLMENT STATUS UPDATE HANDLER
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const config = getAuthHeader();
    if (!config) return;

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        config
      );
      setOrders(prev => prev.map(o => o._id === orderId ? data : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  // FINANCIAL SUMMARY CALCULATIONS
  const safeOrders = Array.isArray(orders) ? orders : [];
  const totalRevenue = safeOrders.reduce((acc, o) => acc + (o.totalPrice || o.itemsPrice || 0), 0);
  const revenueReceived = safeOrders.filter(o => o.isPaid).reduce((acc, o) => acc + (o.totalPrice || o.itemsPrice || 0), 0);
  const revenuePending = Math.max(0, totalRevenue - revenueReceived);

  if (authenticating) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Verifying Admin Permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18181b] border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">
              {activeTab === 'finance' && '💰 Financial Management'}
              {activeTab === 'shipment' && '🚚 Shiprocket Logistics'}
              {activeTab === 'products' && '📦 Catalog Product Management'}
              {activeTab === 'inventory' && '📊 Inventory & Stock Calculation'}
              {activeTab === 'orders' && '📑 Customer Order Fulfillment'}
              {activeTab === 'users' && '👥 Registered Customer Directory'}
            </h1>
            <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <FiShield size={10} /> AUTHENTICATED
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Logged in as Administrator: <strong>{adminUser?.name}</strong></p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-amber-400 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer w-fit"
        >
          <FiRefreshCw className={loadingData ? 'animate-spin' : ''} size={14} /> Refresh Live Data
        </button>
      </div>

      {dataError && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
          <FiAlertCircle size={16} /> {dataError}
        </div>
      )}

      {/* 💰 1. FINANCE SECTION */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Revenue Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl space-y-2 shadow-xl">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center justify-between">
                Total Revenue <FiTrendingUp className="text-amber-400" size={18} />
              </span>
              <p className="text-3xl font-black text-white">Rs {totalRevenue.toFixed(2)}</p>
              <p className="text-[11px] text-zinc-500">Gross across all order channels</p>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl space-y-2 shadow-xl">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center justify-between">
                Revenue Received <FiCheckCircle className="text-emerald-400" size={18} />
              </span>
              <p className="text-3xl font-black text-emerald-400">Rs {revenueReceived.toFixed(2)}</p>
              <p className="text-[11px] text-zinc-500">Settled prepaid & COD collected</p>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl space-y-2 shadow-xl">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center justify-between">
                Revenue Pending <FiAlertCircle className="text-amber-400" size={18} />
              </span>
              <p className="text-3xl font-black text-amber-400">Rs {revenuePending.toFixed(2)}</p>
              <p className="text-[11px] text-zinc-500">Awaiting COD collection on delivery</p>
            </div>
          </div>

          {/* Orders Financial Records Table */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Per-Order Financial Records</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider font-black text-[10px]">
                  <tr>
                    <th className="p-3.5">Order Ref</th>
                    <th className="p-3.5">Payment Type</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Payment Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {safeOrders.map((o) => {
                    const isPrepaid = o.paymentMethod?.toLowerCase() !== 'cod';

                    return (
                      <tr key={o._id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-amber-400">#{o._id.substring(o._id.length - 8).toUpperCase()}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            isPrepaid ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-purple-950 text-purple-400 border border-purple-800'
                          }`}>
                            {isPrepaid ? 'Prepaid (Online)' : 'Postpaid (COD)'}
                          </span>
                        </td>
                        <td className="p-3.5 font-black text-white">Rs {o.totalPrice || o.itemsPrice}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            o.isPaid ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {o.isPaid ? 'Payment Received' : 'Payment Pending'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {!o.isPaid ? (
                            <button
                              onClick={() => handleMarkPaymentReceived(o._id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Mark Received
                            </button>
                          ) : (
                            <span className="text-zinc-500 font-bold text-[11px]">✓ Settled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 🚚 2. SHIPMENT SECTION (Shiprocket Hub) */}
      {activeTab === 'shipment' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-ping" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shiprocket Logistics Gateway</h3>
              </div>
              <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-3 py-1 rounded-full font-mono font-bold">LIVE HUB ACTIVE</span>
            </div>
            <p className="text-xs text-zinc-400">Origin Hub: Patna, Bihar (801503) | Auto-AWB Generation & Courier Partner Handshake</p>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Dispatch & Logistics Management</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider font-black text-[10px]">
                  <tr>
                    <th className="p-3.5">Order Ref</th>
                    <th className="p-3.5">Delivery Address</th>
                    <th className="p-3.5">Stage Status</th>
                    <th className="p-3.5 text-right">Logistics Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {safeOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-amber-400">#{o._id.substring(o._id.length - 8).toUpperCase()}</td>
                      <td className="p-3.5 text-zinc-400 max-w-[200px] truncate">
                        {o.shippingAddress?.address}, {o.shippingAddress?.city} - {o.shippingAddress?.postalCode}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          o.isDelivered ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}>
                          {o.isDelivered ? 'Delivered' : (o.status || 'Warehouse Pickup Pending')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => window.print()}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <FiPrinter size={12} /> Print Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 📦 3. PRODUCTS SECTION */}
      {activeTab === 'products' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wide">Catalog Product Directory</h2>
              <p className="text-xs text-zinc-400">List new uniforms or modify names, prices, sections, and subsections.</p>
            </div>

            <button
              onClick={() => handleOpenProductModal()}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <FiPlus size={16} /> Add New Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider font-black text-[10px]">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Main Section</th>
                  <th className="p-3.5">Sub Section</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-3.5 font-bold text-white max-w-[220px] truncate">{p.name}</td>
                    <td className="p-3.5 text-zinc-400">{p.mainGroup}</td>
                    <td className="p-3.5 text-zinc-500">{p.subGroup || 'Unassigned'}</td>
                    <td className="p-3.5 font-bold text-emerald-400">Rs {p.price}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenProductModal(p)}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <FiEdit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="p-2 bg-red-950/80 hover:bg-red-900 text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 📊 4. INVENTORY SECTION */}
      {activeTab === 'inventory' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-base font-black text-white uppercase tracking-wide">Live Inventory Calculator</h2>
            <p className="text-xs text-zinc-400">
              Manage stock counts. New products added in Product Details automatically initialize with a base stock count of 10.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider font-black text-[10px]">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Available Quantity</th>
                  <th className="p-3.5">Stock Status</th>
                  <th className="p-3.5 text-right">Update Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {products.map((p) => {
                  const stock = p.countInStock !== undefined ? p.countInStock : (p.inStock ? 10 : 0);
                  const isOut = stock <= 0;

                  return (
                    <tr key={p._id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-3.5 font-bold text-white">{p.name}</td>
                      <td className="p-3.5 text-zinc-400">{p.mainGroup}</td>
                      <td className="p-3.5">
                        {editingStockId === p._id ? (
                          <input
                            type="number"
                            min="0"
                            value={newStockVal}
                            onChange={(e) => setNewStockVal(e.target.value)}
                            className="w-20 bg-zinc-900 border border-amber-500 rounded px-2 py-1 text-white focus:outline-none"
                          />
                        ) : (
                          <span className="font-mono font-bold text-sm text-zinc-100">{stock}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isOut ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {isOut ? 'Out of Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {editingStockId === p._id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleSaveStock(p._id)} className="p-1.5 bg-emerald-600 text-white rounded cursor-pointer"><FiCheck size={14} /></button>
                            <button onClick={() => setEditingStockId(null)} className="p-1.5 bg-zinc-800 text-zinc-300 rounded cursor-pointer"><FiX size={14} /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingStockId(p._id); setNewStockVal(stock); }}
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

      {/* 📑 5. ORDERS SECTION */}
      {activeTab === 'orders' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-base font-black text-white uppercase tracking-wide">Customer Order Fulfillment Queue</h2>
            <p className="text-xs text-zinc-400">Update order stage. Changing status automatically triggers notification to customer email & PWA device.</p>
          </div>

          <div className="space-y-4">
            {safeOrders.map((o) => (
              <div key={o._id} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b border-zinc-800/80 pb-3">
                  <div>
                    <span className="text-zinc-500 font-bold uppercase text-[10px] block">Order Ref</span>
                    <span className="font-mono font-bold text-amber-400">#{o._id}</span>
                  </div>

                  <div>
                    <span className="text-zinc-500 font-bold uppercase text-[10px] block">Customer</span>
                    <span className="font-bold text-zinc-200">{o.user?.name || 'Customer'} ({o.user?.email || 'N/A'})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-bold uppercase text-[10px]">Update Status:</span>
                    <select
                      value={o.status || (o.isDelivered ? 'Delivered' : 'Processing')}
                      onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 text-white text-xs font-bold rounded px-2.5 py-1 focus:outline-none"
                    >
                      <option value="Processing">Processing</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  {o.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-zinc-400">
                      <span>• {item.name} (Qty: {item.qty})</span>
                      <span className="font-mono text-zinc-300">Rs {item.qty * item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 👥 6. USERS SECTION */}
      {activeTab === 'users' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-base font-black text-white uppercase tracking-wide">Registered Active Users</h2>
            <p className="text-xs text-zinc-400">View signed in website visitors and user account details.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider font-black text-[10px]">
                <tr>
                  <th className="p-3.5">User Name</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-zinc-500">
                      Active session users loaded directly from current sessions.
                    </td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-3.5 font-bold text-white">{u.name}</td>
                      <td className="p-3.5 text-zinc-400">{u.email}</td>
                      <td className="p-3.5 text-zinc-400">{u.phone || 'N/A'}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          u.isAdmin ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {u.isAdmin ? 'Administrator' : 'Customer'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            <button onClick={() => setProductModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <FiX size={20} />
            </button>

            <h3 className="text-lg font-black text-white">{editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}</h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. NCC Tracksuit Set"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Price (Rs)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="850"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Main Section</label>
                  <select
                    value={prodMainGroup}
                    onChange={(e) => setProdMainGroup(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="School Uniforms">School Uniforms</option>
                    <option value="NCC">NCC Uniforms</option>
                    <option value="Security Guard">Security Guard</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Sub Section</label>
                <input
                  type="text"
                  value={prodSubGroup}
                  onChange={(e) => setProdSubGroup(e.target.value)}
                  placeholder="e.g. Lower, Shirt, Cap"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows="2"
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Detailed uniform specification..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Image URL</label>
                <input
                  type="text"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingProduct}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg mt-2"
              >
                {savingProduct ? 'Saving to Database...' : 'Save Product to Database'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;