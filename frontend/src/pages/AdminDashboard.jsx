import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FiShield, 
  FiDollarSign,
  FiTruck,
  FiPackage,
  FiLayers,
  FiFileText,
  FiUsers,
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiCheckCircle, 
  FiPrinter, 
  FiRefreshCw, 
  FiAlertCircle, 
  FiX, 
  FiTrendingUp, 
  FiCheck,
  FiUpload,
  FiSend,
  FiSearch,
  FiClock,
  FiMapPin,
  FiZap,
  FiAward
} from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'finance';

  const [authenticating, setAuthenticating] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [trackingModalData, setTrackingModalData] = useState(null);

  // Product Modal Form State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodMainGroup, setProdMainGroup] = useState('School Uniforms');
  const [prodSubGroup, setProdSubGroup] = useState('Shirts');
  const [prodWeight, setProdWeight] = useState('0.5');
  const [prodLength, setProdLength] = useState('10');
  const [prodWidth, setProdWidth] = useState('10');
  const [prodHeight, setProdHeight] = useState('5');
  const [prodImages, setProdImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // 🎓 SET CREATOR MODAL STATE
  const [setModalOpen, setSetModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [setName, setSetName] = useState('');
  const [setPrice, setSetPrice] = useState('');
  const [setCategory, setSetCategory] = useState('School Uniforms');
  const [setDesc, setSetDesc] = useState('');
  const [setWeight, setSetWeight] = useState('1.2');
  const [setLength, setSetLength] = useState('20');
  const [setWidth, setSetWidth] = useState('15');
  const [setHeight, setSetHeight] = useState('10');
  const [selectedSetProductIds, setSelectedSetProductIds] = useState([]);
  const [setImages, setSetImages] = useState([]);
  const [uploadingSetImage, setUploadingSetImage] = useState(false);
  const [savingSet, setSavingSet] = useState(false);

  // Inventory Inline Edit State
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockVal, setNewStockVal] = useState('');

  // Individual Product Sale Input Buffer State: { productId: newSalePrice }
  const [individualSaleInputs, setIndividualSaleInputs] = useState({});

  const mainCategories = ['School Uniforms', 'NCC', 'Security Guard'];
  const subGroupOptions = ['Shirts', 'T-Shirts', 'Pants', 'Trousers', 'Shoes', 'Accessories', 'Set', 'Unassigned'];

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const getAuthHeader = useCallback(() => {
    const userInfoString = localStorage.getItem('userInfo');
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    return userInfo?.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : null;
  }, []);

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

      const loadedProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setProducts(loadedProducts);

      const initialSalePrices = {};
      loadedProducts.forEach(p => {
        if (p.discountPrice && p.discountPrice > 0) {
          initialSalePrices[p._id] = p.discountPrice;
        }
      });
      setIndividualSaleInputs(initialSalePrices);

      try {
        const usersRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`, config);
        setUsersList(Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.users || []));
      } catch (userErr) {
        console.warn('Users directory note:', userErr.message);
        setUsersList([]);
      }

    } catch (err) {
      console.error('Admin data fetch error:', err);
      setDataError(err.response?.data?.message || 'Failed to sync with backend.');
    } finally {
      setLoadingData(false);
    }
  }, [getAuthHeader]);

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

  // LOGISTICS ACTIONS
  const handlePushToShiprocket = async (order) => {
    const config = getAuthHeader();
    if (!config) return;

    setActionLoadingId(`push-${order._id}`);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/logistics/create-order`,
        {
          orderId: order._id,
          orderItems: order.orderItems,
          shippingAddress: order.shippingAddress,
          totalPrice: order.totalPrice || order.itemsPrice,
          user: order.user,
          paymentMethod: order.paymentMethod
        },
        config
      );

      setOrders(prev => prev.map(o => o._id === order._id ? {
        ...o,
        shiprocketOrderId: String(data.shiprocket_order_id),
        shipmentId: String(data.shipment_id)
      } : o));

      alert(`✅ Successfully pushed to Shiprocket! Order ID: ${data.shiprocket_order_id}`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to push order to Shiprocket.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleGenerateAWB = async (shipmentId, orderId) => {
    if (!shipmentId) return alert('Order must be pushed to Shiprocket first.');
    const config = getAuthHeader();
    if (!config) return;

    setActionLoadingId(`awb-${shipmentId}`);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/logistics/generate-awb`,
        { shipment_id: shipmentId },
        config
      );

      const awb = data.awb_code || data.response?.awb_code || 'Assigned';
      const courier = data.courier_name || 'Assigned Courier';

      setOrders(prev => prev.map(o => o._id === orderId ? {
        ...o,
        awbCode: awb,
        courierName: courier,
        status: 'In Transit'
      } : o));

      alert(`✅ Courier AWB Code Generated: ${awb}`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate AWB code.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleGenerateLabel = async (shipmentId) => {
    if (!shipmentId) return alert('Order must be pushed to Shiprocket first.');
    const config = getAuthHeader();
    if (!config) return;

    setActionLoadingId(`label-${shipmentId}`);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/logistics/generate-label`,
        { shipment_id: shipmentId },
        config
      );

      if (data.label_url) {
        window.open(data.label_url, '_blank');
      } else {
        alert('Label generated but URL was not returned.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate shipping label.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTrackShipment = async (awbCode) => {
    if (!awbCode) return alert('No AWB Code assigned to this order yet.');
    const config = getAuthHeader();
    if (!config) return;

    setActionLoadingId(`track-${awbCode}`);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/logistics/track/${awbCode}`,
        config
      );
      setTrackingModalData({ awb: awbCode, raw: data.tracking });
    } catch (err) {
      console.error('Tracking error:', err);
      alert('Could not retrieve live tracking updates.');
    } finally {
      setActionLoadingId(null);
    }
  };

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
    } catch (err) {
      console.error('Mark payment received error:', err);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, isPaid: true } : o));
    }
  };

  const handleFileUpload = async (e, target = 'product') => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    if (target === 'set') setUploadingSetImage(true);
    else setUploadingImage(true);

    try {
      const config = getAuthHeader() || {};
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data', ...(config.headers || {}) } }
      );

      const uploadedPath = typeof data === 'string' ? data : (data.image || data.path || data.url);
      if (uploadedPath) {
        if (target === 'set') {
          setSetImages(prev => [...prev, uploadedPath]);
        } else {
          setProdImages(prev => [...prev, uploadedPath]);
        }
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert(err.response?.data?.message || 'Failed to upload image to server.');
    } finally {
      setUploadingSetImage(false);
      setUploadingImage(false);
    }
  };

  // PRODUCT HANDLERS
  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProdName(prod.name);
      setProdPrice(prod.price);
      setProdDesc(prod.description);
      setProdMainGroup(prod.mainGroup);
      setProdSubGroup(prod.subGroup || 'Shirts');
      setProdWeight(prod.weight !== undefined ? String(prod.weight) : '0.5');
      setProdLength(prod.length !== undefined ? String(prod.length) : '10');
      setProdWidth(prod.width !== undefined ? String(prod.width) : '10');
      setProdHeight(prod.height !== undefined ? String(prod.height) : '5');
      
      const existingImgs = Array.isArray(prod.images) && prod.images.length > 0 
        ? prod.images 
        : (prod.image ? [prod.image] : []);
      setProdImages(existingImgs);
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdPrice('');
      setProdDesc('');
      setProdMainGroup('School Uniforms');
      setProdSubGroup('Shirts');
      setProdWeight('0.5');
      setProdLength('10');
      setProdWidth('10');
      setProdHeight('5');
      setProdImages([]);
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
        images: prodImages,
        countInStock: editingProduct ? editingProduct.countInStock : 10,
        weight: Number(prodWeight) || 0.5,
        length: Number(prodLength) || 10,
        width: Number(prodWidth) || 10,
        height: Number(prodHeight) || 5
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

  // 🎓 SET CREATOR HANDLERS
  const handleOpenSetModal = (setItem = null) => {
    if (setItem) {
      setEditingSet(setItem);
      setSetName(setItem.name);
      setSetPrice(setItem.price);
      setSetCategory(setItem.mainGroup);
      setSetDesc(setItem.description);
      setSetWeight(String(setItem.weight || '1.2'));
      setSetLength(String(setItem.length || '20'));
      setSetWidth(String(setItem.width || '15'));
      setSetHeight(String(setItem.height || '10'));
      setSelectedSetProductIds(setItem.selectedComponents || []);
      
      const existingImgs = Array.isArray(setItem.images) && setItem.images.length > 0 
        ? setItem.images 
        : (setItem.image ? [setItem.image] : []);
      setSetImages(existingImgs);
    } else {
      setEditingSet(null);
      setSetName('');
      setSetPrice('');
      setSetCategory('School Uniforms');
      setSetDesc('');
      setSetWeight('1.2');
      setSetLength('20');
      setSetWidth('15');
      setSetHeight('10');
      setSelectedSetProductIds([]);
      setSetImages([]);
    }
    setSetModalOpen(true);
  };

  const handleSaveSet = async (e) => {
    e.preventDefault();
    const config = getAuthHeader();
    if (!config) return;

    setSavingSet(true);
    try {
      // Clean fallback: If no custom set images uploaded, use ONLY 1 cover image from the first component item
      let finalSetImages = [];
      if (setImages.length > 0) {
        finalSetImages = setImages;
      } else {
        const firstComponent = products.find(p => selectedSetProductIds.includes(p._id));
        const firstImg = firstComponent?.images?.[0] || firstComponent?.image;
        if (firstImg) {
          finalSetImages = [firstImg]; // Exactly 1 cover image!
        } else {
          finalSetImages = ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80'];
        }
      }

      const setPayload = {
        name: setName,
        price: Number(setPrice),
        description: setDesc || `Complete ${setCategory} Uniform Set including all required components.`,
        mainGroup: setCategory,
        subGroup: 'Set',
        images: finalSetImages,
        selectedComponents: selectedSetProductIds,
        weight: Number(setWeight) || 1.2,
        length: Number(setLength) || 20,
        width: Number(setWidth) || 15,
        height: Number(setHeight) || 10,
        countInStock: editingSet ? editingSet.countInStock : 10
      };

      if (editingSet) {
        const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/products/${editingSet._id}`, setPayload, config);
        setProducts(prev => prev.map(p => p._id === editingSet._id ? data : p));
      } else {
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/products`, setPayload, config);
        setProducts(prev => [data, ...prev]);
      }

      setSetModalOpen(false);
      alert(`🎓 Uniform Set "${setName}" saved and published to inventory & directory!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save uniform set.');
    } finally {
      setSavingSet(false);
    }
  };

  // INDIVIDUAL SALE HANDLER
  const handleSaveIndividualSale = async (product) => {
    const saleVal = Number(individualSaleInputs[product._id]);
    const config = getAuthHeader();
    if (!config) return;

    if (!saleVal || saleVal <= 0 || saleVal >= product.price) {
      try {
        const { data } = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/${product._id}`,
          { discountPrice: 0, discountPercentage: 0 },
          config
        );
        setProducts(prev => prev.map(p => p._id === product._id ? data : p));
        alert(`Cleared sale pricing for ${product.name}.`);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update sale price.');
      }
      return;
    }

    const calculatedPct = Math.round(((product.price - saleVal) / product.price) * 100);

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${product._id}`,
        { discountPrice: saleVal, discountPercentage: calculatedPct },
        config
      );

      setProducts(prev => prev.map(p => p._id === product._id ? data : p));
      alert(`✅ Updated ${product.name}! Sale Price: Rs ${saleVal} (${calculatedPct}% OFF)`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update sale price.');
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];
  const totalRevenue = safeOrders.reduce((acc, o) => acc + (o.totalPrice || o.itemsPrice || 0), 0);
  const revenueReceived = safeOrders.filter(o => o.isPaid).reduce((acc, o) => acc + (o.totalPrice || o.itemsPrice || 0), 0);
  const revenuePending = Math.max(0, totalRevenue - revenueReceived);

  const createdSetsList = products.filter(p => p.subGroup === 'Set' || p.isSet);

  if (authenticating) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Verifying Admin Permissions...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'finance', label: 'Finance', icon: FiDollarSign },
    { id: 'shipment', label: 'Shipment & Logistics', icon: FiTruck },
    { id: 'products', label: `Products (${products.length})`, icon: FiPackage },
    { id: 'sets', label: `Set Creator (${createdSetsList.length})`, icon: FiAward },
    { id: 'inventory', label: 'Inventory', icon: FiLayers },
    { id: 'orders', label: `Orders (${safeOrders.length})`, icon: FiFileText },
    { id: 'sales', label: 'Flash Sales', icon: FiZap },
    { id: 'users', label: `Users (${usersList.length})`, icon: FiUsers },
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR & TAB NAVIGATION */}
      <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">
                Admin Command Center
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

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-zinc-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg font-black scale-[1.02]'
                    : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon size={15} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {dataError && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
          <FiAlertCircle size={16} /> {dataError}
        </div>
      )}

      {/* 💰 1. FINANCE SECTION */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl space-y-2 shadow-xl">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center justify-between">
                Total Gross Revenue <FiTrendingUp className="text-amber-400" size={18} />
              </span>
              <p className="text-3xl font-black text-white">Rs {totalRevenue.toFixed(2)}</p>
              <p className="text-[11px] text-zinc-500">Combined Prepaid & COD order value</p>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl space-y-2 shadow-xl">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center justify-between">
                Revenue Settled <FiCheckCircle className="text-emerald-400" size={18} />
              </span>
              <p className="text-3xl font-black text-emerald-400">Rs {revenueReceived.toFixed(2)}</p>
              <p className="text-[11px] text-zinc-500">Online gateway & collected COD cash</p>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl space-y-2 shadow-xl">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center justify-between">
                COD Remittance Pending <FiAlertCircle className="text-amber-400" size={18} />
              </span>
              <p className="text-3xl font-black text-amber-400">Rs {revenuePending.toFixed(2)}</p>
              <p className="text-[11px] text-zinc-500">To be collected by courier upon delivery</p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Order Revenue Ledger</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider font-black text-[10px]">
                  <tr>
                    <th className="p-3.5">Order Ref</th>
                    <th className="p-3.5">Payment Method</th>
                    <th className="p-3.5">Order Amount</th>
                    <th className="p-3.5">Settlement Status</th>
                    <th className="p-3.5 text-right">Manual Action</th>
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
                            {isPrepaid ? 'Prepaid (Gateway)' : 'Cash on Delivery'}
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
                              Mark Settled
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

      {/* 🚚 2. SHIPMENT & LOGISTICS CONTROL CENTER */}
      {activeTab === 'shipment' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-ping" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shiprocket Live Logistics Control</h3>
              </div>
              <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-3 py-1 rounded-full font-mono font-bold">Patna Warehouse (801503)</span>
            </div>
            <p className="text-xs text-zinc-400">
              Manage automatic order sync, courier AWB assignment, live tracking, and official shipping label generation directly from your dashboard.
            </p>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Active Shipments & Courier Dispatch</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider font-black text-[10px]">
                  <tr>
                    <th className="p-3.5">Order Ref</th>
                    <th className="p-3.5">Shiprocket IDs</th>
                    <th className="p-3.5">Delivery Address</th>
                    <th className="p-3.5">Current Status</th>
                    <th className="p-3.5 text-right">Logistics Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {safeOrders.map((o) => {
                    const hasShiprocketOrder = Boolean(o.shiprocketOrderId);
                    const hasAWB = Boolean(o.awbCode);

                    return (
                      <tr key={o._id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-amber-400">
                          #{o._id.substring(o._id.length - 8).toUpperCase()}
                        </td>

                        <td className="p-3.5 font-mono text-[11px]">
                          {hasShiprocketOrder ? (
                            <div className="space-y-0.5">
                              <span className="text-emerald-400 block font-bold">SR: {o.shiprocketOrderId}</span>
                              {o.shipmentId && <span className="text-zinc-400 block text-[10px]">Shipment: {o.shipmentId}</span>}
                              {o.courierName && <span className="text-amber-400 block text-[10px] font-sans font-bold">{o.courierName}</span>}
                            </div>
                          ) : (
                            <span className="text-amber-500/80 italic font-semibold">Not Synced</span>
                          )}
                        </td>

                        <td className="p-3.5 text-zinc-400 max-w-[180px] truncate">
                          {o.shippingAddress?.address}, {o.shippingAddress?.city} ({o.shippingAddress?.postalCode})
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            o.status === 'Cancelled'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : o.isDelivered
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}>
                            {o.status || (o.isDelivered ? 'Delivered' : 'Processing')}
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          {!hasShiprocketOrder && (
                            <button
                              onClick={() => handlePushToShiprocket(o)}
                              disabled={actionLoadingId === `push-${o._id}`}
                              className="bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <FiSend size={12} /> {actionLoadingId === `push-${o._id}` ? 'Pushing...' : 'Push to SR'}
                            </button>
                          )}

                          {hasShiprocketOrder && !hasAWB && (
                            <button
                              onClick={() => handleGenerateAWB(o.shipmentId, o._id)}
                              disabled={actionLoadingId === `awb-${o.shipmentId}`}
                              className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <FiTruck size={12} /> {actionLoadingId === `awb-${o.shipmentId}` ? 'Assigning...' : 'Assign Courier'}
                            </button>
                          )}

                          {hasShiprocketOrder && (
                            <button
                              onClick={() => handleGenerateLabel(o.shipmentId)}
                              disabled={actionLoadingId === `label-${o.shipmentId}`}
                              className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-zinc-700 transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <FiPrinter size={12} /> Print Label
                            </button>
                          )}

                          {hasAWB && (
                            <button
                              onClick={() => handleTrackShipment(o.awbCode)}
                              disabled={actionLoadingId === `track-${o.awbCode}`}
                              className="bg-purple-950/80 hover:bg-purple-900 text-purple-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-purple-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <FiSearch size={12} /> Live Track
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
        </div>
      )}

      {/* 📦 3. PRODUCTS SECTION */}
      {activeTab === 'products' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wide">Catalog Product Directory</h2>
              <p className="text-xs text-zinc-400">List new uniforms or modify names, prices, weight, dimensions, and categories.</p>
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
                  <th className="p-3.5">Image</th>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Main Section</th>
                  <th className="p-3.5">Sub Section</th>
                  <th className="p-3.5">Weight / Specs</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {products.map((p) => {
                  const firstImg = p.images?.[0] || p.image;

                  return (
                    <tr key={p._id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-3.5">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                          {firstImg ? (
                            <img src={getImageUrl(firstImg)} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <FiPackage className="text-zinc-600" size={16} />
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-white max-w-[180px] truncate">{p.name}</td>
                      <td className="p-3.5 text-zinc-400">{p.mainGroup}</td>
                      <td className="p-3.5 text-zinc-500">{p.subGroup || 'Unassigned'}</td>
                      <td className="p-3.5 font-mono text-[11px] text-zinc-400">
                        <span className="text-amber-400 font-bold">{p.weight || 0.5} kg</span>
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🎓 4. SET CREATOR SECTION */}
      {activeTab === 'sets' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wide">Uniform Set Creator</h2>
              <p className="text-xs text-zinc-400">
                Assemble complete dress kits. Created sets publish live to Inventory, Category pages, and the Uniform Directory.
              </p>
            </div>

            <button
              onClick={() => handleOpenSetModal()}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <FiPlus size={16} /> Create Uniform Set
            </button>
          </div>

          {createdSetsList.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-zinc-800 rounded-2xl text-center space-y-3">
              <FiAward size={36} className="mx-auto text-zinc-600" />
              <p className="text-sm font-semibold text-zinc-400">No uniform sets created yet.</p>
              <button
                onClick={() => handleOpenSetModal()}
                className="text-xs text-amber-400 hover:underline font-bold cursor-pointer"
              >
                + Assemble your first uniform set
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {createdSetsList.map((setItem) => {
                const coverImg = setItem.images?.[0] || setItem.image;

                return (
                  <div key={setItem._id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-4 space-y-3 flex flex-col justify-between hover:border-zinc-700 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {coverImg ? (
                            <img src={getImageUrl(coverImg)} alt={setItem.name} className="w-full h-full object-cover" />
                          ) : (
                            <FiAward className="text-amber-500" size={20} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                            {setItem.mainGroup} • SET
                          </span>
                          <h3 className="font-bold text-sm text-white truncate">{setItem.name}</h3>
                          <p className="text-xs font-black text-emerald-400">Rs {setItem.price}</p>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2">{setItem.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs">
                      <span className="text-zinc-500 font-mono">Stock: <strong>{setItem.countInStock}</strong></span>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleOpenSetModal(setItem)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-bold cursor-pointer"
                        >
                          Edit Set
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(setItem._id)}
                          className="p-1.5 bg-red-950/80 text-red-400 rounded-lg hover:bg-red-900 cursor-pointer"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 📊 5. INVENTORY SECTION */}
      {activeTab === 'inventory' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-base font-black text-white uppercase tracking-wide">Live Inventory Calculator</h2>
            <p className="text-xs text-zinc-400">
              Manage stock counts for both individual components and complete uniform sets.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider font-black text-[10px]">
                <tr>
                  <th className="p-3.5">Product / Set Name</th>
                  <th className="p-3.5">Type & Section</th>
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
                      <td className="p-3.5 font-bold text-white flex items-center gap-2">
                        {p.subGroup === 'Set' && <FiAward className="text-amber-400 flex-shrink-0" />} {p.name}
                      </td>
                      <td className="p-3.5 text-zinc-400">{p.mainGroup} ({p.subGroup})</td>
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

      {/* 📑 6. ORDERS SECTION */}
      {activeTab === 'orders' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-base font-black text-white uppercase tracking-wide">Customer Order Fulfillment Queue</h2>
            <p className="text-xs text-zinc-400">Update order stage. Changing status automatically updates the customer profile timeline.</p>
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
                      <option value="Cancelled">Cancelled</option>
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

      {/* ⚡ 7. FLASH SALES SECTION */}
      {activeTab === 'sales' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wide">Individual Item Price Markdown</h2>
            <p className="text-xs text-zinc-400">
              Enter a new sale price for any catalog item. The discount percentage will auto-calculate and display across the store.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider font-black text-[10px]">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Original Price</th>
                  <th className="p-3.5">New Sale Price (Rs)</th>
                  <th className="p-3.5">Calculated Discount</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {products.map((p) => {
                  const inputVal = individualSaleInputs[p._id] !== undefined ? individualSaleInputs[p._id] : (p.discountPrice || '');
                  const numVal = Number(inputVal);
                  const hasSale = numVal > 0 && numVal < p.price;
                  const calculatedPct = hasSale ? Math.round(((p.price - numVal) / p.price) * 100) : 0;

                  return (
                    <tr key={p._id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-3.5 font-bold text-white max-w-[200px] truncate">{p.name}</td>
                      <td className="p-3.5 text-zinc-400">{p.mainGroup} / {p.subGroup}</td>
                      <td className="p-3.5 font-mono text-zinc-300">Rs {p.price}</td>
                      <td className="p-3.5">
                        <input
                          type="number"
                          placeholder={p.price}
                          value={inputVal}
                          onChange={(e) => setIndividualSaleInputs({ ...individualSaleInputs, [p._id]: e.target.value })}
                          className="w-28 bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none"
                        />
                      </td>
                      <td className="p-3.5">
                        {hasSale ? (
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                            {calculatedPct}% OFF
                          </span>
                        ) : (
                          <span className="text-zinc-600 italic">No Discount</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleSaveIndividualSale(p)}
                          className="bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Update Price
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 👥 8. USERS SECTION */}
      {activeTab === 'users' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wide">Registered Customer Directory</h2>
              <p className="text-xs text-zinc-400">All registered user accounts fetched directly from MongoDB database.</p>
            </div>
            
            <button
              onClick={fetchDashboardData}
              className="text-xs text-amber-400 font-bold flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <FiRefreshCw className={loadingData ? 'animate-spin' : ''} size={13} /> Sync Users
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider font-black text-[10px]">
                <tr>
                  <th className="p-3.5">User Name</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Account Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-zinc-500">
                      No user records returned from `/api/users`.
                    </td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-3.5 font-bold text-white">{u.name}</td>
                      <td className="p-3.5 text-zinc-300 font-medium">{u.email}</td>
                      <td className="p-3.5 text-zinc-400 font-mono">{u.phone || 'N/A'}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          u.isAdmin ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
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

      {/* VISUAL TRACKING TIMELINE MODAL */}
      {trackingModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FiTruck className="text-amber-400" /> Live Shiprocket Tracking (AWB: {trackingModalData.awb})
              </h3>
              <button onClick={() => setTrackingModalData(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                <FiX size={18} />
              </button>
            </div>

            {trackingModalData.raw?.tracking_data?.shipment_track_activities?.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {trackingModalData.raw.tracking_data.shipment_track_activities.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-amber-500 pl-3 py-1">
                    <div className="flex-1 space-y-0.5">
                      <p className="font-bold text-white">{act.activity || act.location}</p>
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <FiMapPin size={12} /> {act.location || 'In Transit'}
                      </p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <FiClock size={10} /> {act.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-950 p-4 rounded-xl text-xs font-mono text-zinc-300 max-h-60 overflow-x-auto">
                <p className="text-amber-400 font-bold mb-2">Live Raw Response from Shiprocket:</p>
                <pre>{JSON.stringify(trackingModalData.raw, null, 2)}</pre>
              </div>
            )}

            <button onClick={() => setTrackingModalData(null)} className="w-full bg-white text-black font-bold py-2.5 rounded-xl text-xs cursor-pointer">
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* 🎓 MODAL: UNIFORM SET CREATOR */}
      {setModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto scrollbar-hide">
            <button onClick={() => setSetModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer">
              <FiX size={20} />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <FiAward className="text-amber-400" /> {editingSet ? 'Edit Uniform Set' : 'Assemble New Uniform Set'}
            </h3>

            <form onSubmit={handleSaveSet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Uniform Category</label>
                <select
                  value={setCategory}
                  onChange={(e) => {
                    setSetCategory(e.target.value);
                    setSelectedSetProductIds([]);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {mainCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Set Name</label>
                <input
                  type="text"
                  required
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                  placeholder="e.g. Complete NCC Cadets Uniform Bundle"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Set Price (Rs)</label>
                  <input
                    type="number"
                    required
                    value={setPrice}
                    onChange={(e) => setSetPrice(e.target.value)}
                    placeholder="2450"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Package Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={setWeight}
                    onChange={(e) => setSetWeight(e.target.value)}
                    placeholder="1.2"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 📦 PACKAGE DIMENSIONS (SHIPROCKET BOX SPECS) */}
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FiPackage size={14} /> Package Dimensions (Shiprocket Box Specs)
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Length (cm)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={setLength}
                      onChange={(e) => setSetLength(e.target.value)}
                      placeholder="20"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Width (cm)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={setWidth}
                      onChange={(e) => setSetWidth(e.target.value)}
                      placeholder="15"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Height (cm)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={setHeight}
                      onChange={(e) => setSetHeight(e.target.value)}
                      placeholder="10"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMICALLY FILTERED INVENTORY SELECTION */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Select {setCategory} Components ({selectedSetProductIds.length} Linked)
                </label>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                  {products
                    .filter(p => p.mainGroup.toLowerCase().includes(setCategory.toLowerCase()) && p.subGroup !== 'Set')
                    .map((p) => {
                      const isSelected = selectedSetProductIds.includes(p._id);
                      return (
                        <div
                          key={p._id}
                          onClick={() => {
                            setSelectedSetProductIds(prev =>
                              prev.includes(p._id) ? prev.filter(id => id !== p._id) : [...prev, p._id]
                            );
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer text-xs ${
                            isSelected ? 'bg-amber-950/60 border-amber-500/80 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <span className="font-bold">• {p.name} ({p.subGroup})</span>
                          <span className="font-mono text-zinc-400">Rs {p.price}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows="2"
                  value={setDesc}
                  onChange={(e) => setSetDesc(e.target.value)}
                  placeholder="Complete uniform set containing shirt, trousers, belt, cap, and boots..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 🖼️ SET PICTURES */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Set Custom Pictures ({setImages.length} Uploaded)
                </label>
                
                <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl min-h-[90px]">
                  {setImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800 group flex-shrink-0">
                      <img src={getImageUrl(imgUrl)} alt={`Set Image ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setSetImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-red-950/80 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete Image"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <label className="w-16 h-16 rounded-lg border-2 border-dashed border-zinc-700 hover:border-amber-500 flex flex-col items-center justify-center text-zinc-400 hover:text-amber-400 cursor-pointer transition-colors text-center p-1 bg-zinc-900/50 flex-shrink-0">
                    {uploadingSetImage ? (
                      <FiRefreshCw className="animate-spin text-amber-400" size={18} />
                    ) : (
                      <>
                        <FiUpload size={16} />
                        <span className="text-[9px] font-bold mt-1 leading-tight">+ Add</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'set')}
                      disabled={uploadingSetImage}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Upload custom cover/photos for this set. If empty, 1 placeholder image will be assigned.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingSet}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg mt-2 disabled:opacity-50"
              >
                {savingSet ? 'Publishing Uniform Set...' : 'Save & Publish Uniform Set'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🖼️ MODAL: ADD / EDIT PRODUCT */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto scrollbar-hide">
            <button onClick={() => setProductModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer">
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
                  placeholder="e.g. NCC DMS Boots"
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
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {mainCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Sub Section</label>
                <select
                  value={prodSubGroup}
                  onChange={(e) => setProdSubGroup(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {subGroupOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* WEIGHT & DIMENSIONS */}
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FiPackage size={14} /> Shiprocket Weight & Box Specs
                </label>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      value={prodWeight}
                      onChange={(e) => setProdWeight(e.target.value)}
                      placeholder="0.5"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Length (cm)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={prodLength}
                      onChange={(e) => setProdLength(e.target.value)}
                      placeholder="10"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Width (cm)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={prodWidth}
                      onChange={(e) => setProdWidth(e.target.value)}
                      placeholder="10"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Height (cm)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={prodHeight}
                      onChange={(e) => setProdHeight(e.target.value)}
                      placeholder="5"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
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
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Product Pictures ({prodImages.length} Uploaded)
                </label>
                
                <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl min-h-[90px]">
                  {prodImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800 group flex-shrink-0">
                      <img src={getImageUrl(imgUrl)} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setProdImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-red-950/80 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete Image"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <label className="w-16 h-16 rounded-lg border-2 border-dashed border-zinc-700 hover:border-amber-500 flex flex-col items-center justify-center text-zinc-400 hover:text-amber-400 cursor-pointer transition-colors text-center p-1 bg-zinc-900/50 flex-shrink-0">
                    {uploadingImage ? (
                      <FiRefreshCw className="animate-spin text-amber-400" size={18} />
                    ) : (
                      <>
                        <FiUpload size={16} />
                        <span className="text-[9px] font-bold mt-1 leading-tight">+ Add</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'product')}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProduct}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg mt-2 disabled:opacity-50"
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