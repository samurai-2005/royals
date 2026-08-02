import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUser, 
  FiPackage, 
  FiCheckCircle, 
  FiFileText, 
  FiShield, 
  FiRefreshCw, 
  FiTruck, 
  FiChevronRight,
  FiX,
  FiArchive,
  FiTag,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiImage
} from 'react-icons/fi';

const UserProfile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});

  // Default tab: 'edit-profile' for regular users, 'inventory' for admins
  const [activeTab, setActiveTab] = useState(userInfo?.isAdmin ? 'inventory' : 'edit-profile');

  // Customer Profile Form State
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [phone, setPhone] = useState(userInfo?.phone || '');

  // Admin Hub States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', 
    description: '', 
    price: '', 
    mainGroup: 'School Uniforms', 
    subGroup: 'Unassigned', 
    images: [] 
  });

  // UI Status State
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // OTP Verification Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [verifyingChannel, setVerifyingChannel] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpStatus, setOtpStatus] = useState({ type: '', message: '' });

  // Universal Image Resolver
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // Fetch Inventory & Orders for Admin
  useEffect(() => {
    if (!userInfo?.isAdmin) return;

    const fetchInventory = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch inventory", err); 
      }
    };

    const fetchOrders = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, config);
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };

    if (activeTab === 'inventory' || activeTab === 'sales') {
      fetchInventory();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, userInfo]);

  // Save Profile Changes Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        { name, email, phone },
        config
      );

      const updatedUserInfo = { ...userInfo, ...data, token: userInfo.token };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);

      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Trigger OTP Verification
  const handleSendVerificationOTP = async (channel) => {
    const identifier = channel === 'email' ? email : phone;
    if (!identifier) {
      alert(`Please enter a valid ${channel === 'email' ? 'Email Address' : 'Mobile Phone Number'} first.`);
      return;
    }

    setVerifyingChannel(channel);
    setOtpLoading(true);
    setOtpStatus({ type: '', message: '' });

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/send-otp`, {
        identifier,
        channel,
      });

      setOtpModalOpen(true);
      setOtpStatus({ type: 'success', message: '6-digit verification code sent to your registered email' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send verification OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP Code
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setOtpStatus({ type: 'error', message: 'Please enter a valid 6-digit OTP.' });
      return;
    }

    setOtpLoading(true);
    setOtpStatus({ type: '', message: '' });

    const identifier = verifyingChannel === 'email' ? email : phone;

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/verify-otp`, {
        identifier,
        otp: otpCode,
      });

      const updatedUserInfo = { ...userInfo, ...data, token: userInfo.token };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);

      setOtpModalOpen(false);
      setOtpCode('');
      setStatus({
        type: 'success',
        message: `${verifyingChannel === 'email' ? 'Email Address' : 'Mobile Phone'} verified successfully!`,
      });
    } catch (err) {
      setOtpStatus({
        type: 'error',
        message: err.response?.data?.message || 'Invalid or expired OTP code.',
      });
    } finally {
      setOtpLoading(false);
    }
  };

  // Admin Product Form Handlers
  const handleProductChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const uploadMultipleFilesHandler = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const uploadPromises = files.map(file => {
        const fileData = new FormData();
        fileData.append('image', file);
        return axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, fileData, config);
      });

      const responses = await Promise.all(uploadPromises);
      const newImagePaths = responses.map(res => res.data);

      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImagePaths] }));
      setUploading(false);
    } catch (err) {
      console.error("Failed to upload images", err);
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      mainGroup: product.mainGroup,
      subGroup: product.subGroup,
      images: product.images || []
    });
    setActiveTab('form');
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}`, config);
      setProducts(prev => prev.filter(p => p._id !== productId));
      setStatus({ type: 'success', message: 'Product deleted successfully from inventory.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to delete product.' });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', mainGroup: 'School Uniforms', subGroup: 'Unassigned', images: [] });
    setStatus({ type: '', message: '' });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      let response;
      if (editingId) {
        response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/products/${editingId}`, formData, config);
        setStatus({ type: 'success', message: `Successfully updated: ${response.data.name}` });
      } else {
        response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/products`, formData, config);
        setStatus({ type: 'success', message: `Successfully created: ${response.data.name}` });
      }
      resetForm();
      setActiveTab('inventory');
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Error saving product' });
    } finally {
      setLoading(false);
    }
  };

  const updateProductDiscount = async (product, newDiscountPrice, discountPercentage) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const payload = {
        name: product.name,
        description: product.description,
        price: product.price,
        mainGroup: product.mainGroup,
        subGroup: product.subGroup,
        images: product.images,
        discountPrice: newDiscountPrice,
        discountPercentage: discountPercentage
      };
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/products/${product._id}`, payload, config);
      
      setProducts(products.map(p => 
        p._id === product._id ? { ...p, discountPrice: newDiscountPrice, discountPercentage } : p
      ));
      setStatus({ type: 'success', message: `Successfully updated discount for ${product.name}` });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to update discount'});
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/status`, { status: newStatus }, config);
      
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error(err);
      alert("Error updating order status.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-12 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* LEFT SUB-NAVIGATION SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            
            {/* ADMIN HUB NAVIGATION SECTION (Visible if userInfo.isAdmin === true) */}
            {userInfo?.isAdmin && (
              <div>
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-3">Admin Hub</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                      activeTab === 'inventory' ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <span className="flex items-center"><FiArchive className="mr-3" /> Inventory</span>
                    <FiChevronRight />
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                      activeTab === 'orders' ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <span className="flex items-center"><FiPackage className="mr-3" /> Order Manager</span>
                    <FiChevronRight />
                  </button>

                  <button
                    onClick={() => setActiveTab('sales')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                      activeTab === 'sales' ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <span className="flex items-center"><FiTag className="mr-3" /> Sale & Discounts</span>
                    <FiChevronRight />
                  </button>

                  <button
                    onClick={() => { resetForm(); setActiveTab('form'); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                      activeTab === 'form' ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <span className="flex items-center"><FiPlus className="mr-3" /> {editingId ? 'Edit Product' : 'Add Product'}</span>
                    <FiChevronRight />
                  </button>
                </div>
                <hr className="border-zinc-800 my-4" />
              </div>
            )}

            {/* ACCOUNT NAVIGATION SECTION */}
            <div>
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Account</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('edit-profile')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === 'edit-profile' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <span className="flex items-center"><FiUser className="mr-3" /> Edit Profile</span>
                  <FiChevronRight />
                </button>
                
                {!userInfo?.isAdmin && (
                  <button
                    onClick={() => setActiveTab('my-orders')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                      activeTab === 'my-orders' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <span className="flex items-center"><FiPackage className="mr-3" /> Order History</span>
                    <FiChevronRight />
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-950/40 transition-colors"
                >
                  <span>Secure Logout</span>
                </button>
              </div>
            </div>

          </div>

          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Legal Policies</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <a href="/terms" className="flex items-center justify-between p-2 hover:text-white transition-colors">
                <span className="flex items-center"><FiFileText className="mr-3" /> Terms and Conditions</span>
                <FiChevronRight />
              </a>
              <a href="/privacy" className="flex items-center justify-between p-2 hover:text-white transition-colors">
                <span className="flex items-center"><FiShield className="mr-3" /> Privacy Policy</span>
                <FiChevronRight />
              </a>
              <a href="/cancellation" className="flex items-center justify-between p-2 hover:text-white transition-colors">
                <span className="flex items-center"><FiRefreshCw className="mr-3" /> Cancellation Policy</span>
                <FiChevronRight />
              </a>
              <a href="/shipping" className="flex items-center justify-between p-2 hover:text-white transition-colors">
                <span className="flex items-center"><FiTruck className="mr-3" /> Shipping Policy</span>
                <FiChevronRight />
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT MAIN PANEL */}
        <div className="md:col-span-3">

          {/* TAB 1: EDIT PROFILE */}
          {activeTab === 'edit-profile' && (
            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-8 shadow-2xl">
              
              {status.message && (
                <div className={`p-4 mb-6 rounded-xl text-xs font-bold ${status.type === 'success' ? 'bg-green-950/80 text-green-400 border border-green-800' : 'bg-red-950/80 text-red-400 border border-red-800'}`}>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                    {userInfo?.isEmailVerified ? (
                      <span className="text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold flex items-center">
                        <FiCheckCircle className="mr-1" /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendVerificationOTP('email')}
                        disabled={otpLoading}
                        className="text-[11px] bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2.5 py-0.5 rounded-full font-bold hover:bg-amber-900 transition-colors cursor-pointer flex items-center"
                      >
                        ⚠️ Not Verified — Click to Verify
                      </button>
                    )}
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Phone Number</label>
                    {userInfo?.isPhoneVerified ? (
                      <span className="text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold flex items-center">
                        <FiCheckCircle className="mr-1" /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendVerificationOTP('sms')}
                        disabled={otpLoading}
                        className="text-[11px] bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2.5 py-0.5 rounded-full font-bold hover:bg-amber-900 transition-colors cursor-pointer flex items-center"
                      >
                        ⚠️ Not Verified — Click to Verify
                      </button>
                    )}
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter your mobile phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer text-base disabled:opacity-50 mt-4"
                >
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* ADMIN TAB: INVENTORY */}
          {activeTab === 'inventory' && userInfo?.isAdmin && (
            <div className="bg-[#18181b] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Inventory</h1>
                <span className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded font-bold">{products.length} Items</span>
              </div>

              {status.message && (
                <div className={`p-4 mb-6 rounded-xl text-xs font-bold ${status.type === 'success' ? 'bg-green-950/80 text-green-400 border border-green-800' : 'bg-red-950/80 text-red-400 border border-red-800'}`}>
                  {status.message}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-zinc-900 border-b border-zinc-800">
                    <tr>
                      <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Product Info</th>
                      <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Category</th>
                      <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Price</th>
                      <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 text-zinc-500 text-center">No products found in inventory.</td></tr>
                    ) : (
                      products.map(p => (
                        <tr key={p._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <td className="p-4 flex items-center space-x-4">
                            <div className="w-10 h-10 bg-zinc-900 rounded overflow-hidden flex items-center justify-center border border-zinc-700">
                               {p.images && p.images.length > 0 ? (
                                 <img src={getImageUrl(p.images[0])} className="w-full h-full object-cover" alt="thumb" />
                               ) : (
                                 <FiImage className="text-zinc-600" />
                               )}
                            </div>
                            <span className="font-semibold text-sm max-w-[200px] truncate">{p.name}</span>
                          </td>
                          <td className="p-4 text-sm text-zinc-400">{p.mainGroup} / {p.subGroup}</td>
                          <td className="p-4 text-sm font-bold text-white">Rs {p.price}</td>
                          <td className="p-4 text-right">
                            <div className="inline-flex items-center space-x-2">
                              <button 
                                onClick={() => handleEditClick(p)}
                                className="inline-flex items-center text-xs font-bold bg-zinc-800 text-white px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors"
                              >
                                <FiEdit2 className="mr-1.5" size={12} /> Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(p._id)}
                                className="inline-flex items-center text-xs font-bold bg-red-950/60 border border-red-800/60 text-red-300 px-3 py-1.5 rounded hover:bg-red-900/80 transition-colors"
                              >
                                <FiTrash2 className="mr-1.5" size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN TAB: SALE & DISCOUNTS */}
          {activeTab === 'sales' && userInfo?.isAdmin && (
            <div className="bg-[#18181b] rounded-2xl border border-zinc-800 p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Sale & Discount Manager</h1>
                <span className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded font-bold">{products.length} Items</span>
              </div>

              {status.message && (
                <div className={`p-4 mb-6 rounded-xl text-xs font-bold ${status.type === 'success' ? 'bg-green-950/80 text-green-400 border border-green-800' : 'bg-red-950/80 text-red-400 border border-red-800'}`}>
                  {status.message}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-zinc-900 border-b border-zinc-800">
                    <tr>
                      <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Product Info</th>
                      <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Original Price</th>
                      <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Sale Price</th>
                      <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 flex items-center space-x-4">
                          <span className="font-semibold text-sm max-w-[200px] truncate">{p.name}</span>
                        </td>
                        <td className="p-4 text-sm text-zinc-400 font-bold">Rs {p.price}</td>
                        <td className="p-4">
                          <input 
                            type="number"
                            min="0"
                            defaultValue={p.discountPrice || ''}
                            placeholder={p.price}
                            className="w-24 bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded text-sm text-white focus:outline-none"
                            onBlur={(e) => {
                              const newPrice = Number(e.target.value);
                              if (newPrice > 0 && newPrice < p.price) {
                                const discount = Math.round(((p.price - newPrice) / p.price) * 100);
                                updateProductDiscount(p, newPrice, discount);
                              } else if (e.target.value === '' || newPrice === p.price) {
                                updateProductDiscount(p, 0, 0);
                              }
                            }}
                          />
                        </td>
                        <td className="p-4 text-sm font-bold text-green-400">
                          {p.discountPercentage ? `${p.discountPercentage}% OFF` : '0%'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN TAB: ORDER MANAGER */}
          {activeTab === 'orders' && userInfo?.isAdmin && (
            <div className="bg-[#18181b] rounded-2xl border border-zinc-800 p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Order Management</h1>
                <span className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded font-bold">{orders.length} Orders</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-zinc-900 border-b border-zinc-800">
                    <tr>
                      <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Order ID</th>
                      <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Customer</th>
                      <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Total</th>
                      <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 text-zinc-500 text-center">No orders placed yet.</td></tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                          <td className="p-4 font-bold text-sm">#{order._id.substring(18).toUpperCase()}</td>
                          <td className="p-4 text-sm">{order.user?.name || 'Guest'}</td>
                          <td className="p-4 text-sm font-bold">Rs {order.totalPrice}</td>
                          <td className="p-4">
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              className="bg-zinc-900 text-xs font-bold p-1.5 rounded border border-zinc-700"
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN TAB: ADD / EDIT PRODUCT FORM */}
          {activeTab === 'form' && userInfo?.isAdmin && (
            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
              <h1 className="text-2xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h1>
              
              <form onSubmit={handleProductSubmit} className="space-y-6">
                
                {/* Product Images Upload */}
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-dashed border-zinc-700">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Product Images</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={uploadMultipleFilesHandler} 
                    className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-white file:text-black hover:file:bg-zinc-200 transition-colors cursor-pointer mb-4" 
                  />
                  {uploading && <p className="text-sm text-yellow-500 font-medium mb-4">Uploading files to server...</p>}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group aspect-square bg-zinc-900 rounded border border-zinc-700 overflow-hidden">
                          <img src={getImageUrl(img)} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeImage(index)} 
                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-lg" 
                            title="Remove Image"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Product Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleProductChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea name="description" required rows="4" value={formData.description} onChange={handleProductChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Price (Rs)</label>
                    <input type="number" name="price" required min="0" value={formData.price} onChange={handleProductChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Main Group</label>
                    <select name="mainGroup" value={formData.mainGroup} onChange={handleProductChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white">
                      {['School Uniforms', 'NCC', 'Security Guard'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Sub Group</label>
                    <select name="subGroup" value={formData.subGroup} onChange={handleProductChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white">
                      {['Unassigned', 'Shirts', 'T-Shirts', 'Pants', 'Trousers', 'Accessories'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 shadow-lg text-base cursor-pointer">
                  {loading ? 'Saving...' : editingId ? 'Update Product' : 'Publish Product'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* OTP VERIFICATION MODAL */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setOtpModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Verify {verifyingChannel === 'email' ? 'Email Address' : 'Mobile Phone'}</h3>
            <p className="text-xs text-zinc-400 mb-6">Enter the 6-digit verification code sent to your registered email.</p>

            {otpStatus.message && (
              <div className={`p-3 mb-4 rounded-lg text-xs font-semibold ${otpStatus.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                {otpStatus.message}
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input 
                type="text" 
                maxLength="6"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-center tracking-[0.5em] text-2xl font-mono text-white rounded-lg p-3 focus:outline-none focus:border-white"
              />

              <button 
                type="submit" 
                disabled={otpLoading}
                className="w-full bg-white text-black font-black py-3 rounded-lg hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
              >
                {otpLoading ? 'Verifying...' : 'Confirm & Verify'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;