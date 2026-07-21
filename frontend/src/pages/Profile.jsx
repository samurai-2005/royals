import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiEdit2, 
  FiTrash2, 
  FiImage, 
  FiPlus, 
  FiPackage, 
  FiArchive,
  FiArrowLeft,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiExternalLink,
  FiTag
} from 'react-icons/fi';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // inventory, form, orders, sales
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', 
    description: '', 
    price: '', 
    mainGroup: 'NCC', 
    subGroup: 'Unassigned', 
    images: [] 
  });

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch inventory", error); 
      }
    };

    const fetchOrders = async () => {
      setSelectedOrder(null); 
      
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/orders', config);
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
    };

    if (activeTab === 'inventory' || activeTab === 'sales') {
      fetchInventory();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, userInfo.token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const uploadMultipleFilesHandler = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const uploadPromises = files.map(file => {
        const fileData = new FormData();
        fileData.append('image', file);
        return axios.post('http://localhost:5000/api/upload', fileData, config);
      });

      const responses = await Promise.all(uploadPromises);
      const newImagePaths = responses.map(res => res.data);

      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImagePaths] }));
      setUploading(false);
    } catch (error) {
      console.error("Failed to upload images", error);
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

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', mainGroup: 'NCC', subGroup: 'Unassigned', images: [] });
    setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      let response;
      if (editingId) {
        response = await axios.put(`http://localhost:5000/api/products/${editingId}`, formData, config);
        setStatus({ type: 'success', message: `Successfully updated: ${response.data.name}` });
      } else {
        response = await axios.post('http://localhost:5000/api/products', formData, config);
        setStatus({ type: 'success', message: `Successfully created: ${response.data.name}` });
      }
      resetForm();
      setActiveTab('inventory');
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Error saving product' });
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
      await axios.put(`http://localhost:5000/api/products/${product._id}`, payload, config);
      
      setProducts(products.map(p => 
        p._id === product._id ? { ...p, discountPrice: newDiscountPrice, discountPercentage } : p
      ));
      setStatus({ type: 'success', message: `Successfully updated discount for ${product.name}` });
    } catch (error) {console.error("Discount update failed:", error); 
      setStatus({ type: 'error', message: 'Failed to update discount'});
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus }, config);
      
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Error updating order status.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="flex flex-row h-full bg-[#0f0f0f] text-white overflow-hidden">
      
      <div className="w-52 flex-shrink-0 bg-[#18181b] border-r border-zinc-800 p-5 flex flex-col z-10 shadow-xl">
        <h2 className="text-sm font-black text-white mb-8 tracking-widest uppercase">Admin Hub</h2>
        
        <div className="flex flex-col space-y-2">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`text-left px-4 py-3 rounded text-sm transition-colors flex items-center ${activeTab === 'inventory' ? 'bg-zinc-800 font-bold text-white shadow-inner' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <FiArchive className="mr-3" /> Inventory
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`text-left px-4 py-3 rounded text-sm transition-colors flex items-center ${activeTab === 'orders' ? 'bg-zinc-800 font-bold text-white shadow-inner' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <FiPackage className="mr-3" /> Orders
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className={`text-left px-4 py-3 rounded text-sm transition-colors flex items-center ${activeTab === 'sales' ? 'bg-zinc-800 font-bold text-white shadow-inner' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <FiTag className="mr-3" /> Sale & Discounts
          </button>
          <button 
            onClick={() => { resetForm(); setActiveTab('form'); }}
            className={`text-left px-4 py-3 rounded text-sm transition-colors flex items-center justify-between ${activeTab === 'form' ? 'bg-zinc-800 font-bold text-white shadow-inner' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <span className="flex items-center"><FiPlus className="mr-3" /> {editingId ? 'Edit Product' : 'Add Product'}</span>
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded text-sm text-red-400 font-bold hover:bg-red-900/20 hover:text-red-300 transition-colors"
          >
            Secure Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto bg-zinc-950">
        
        {activeTab === 'inventory' && (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Manage Inventory</h1>
              <span className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded font-bold">{products.length} Items</span>
            </div>

            {status.message && (
              <div className="p-4 mb-6 rounded text-sm font-semibold bg-green-900/30 text-green-400 border border-green-800">
                {status.message}
              </div>
            )}

            <div className="bg-[#18181b] rounded-lg border border-zinc-800 overflow-hidden shadow-lg">
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
                               <img src={`http://localhost:5000${p.images[0]}`} className="w-full h-full object-cover" alt="thumb" />
                             ) : (
                               <FiImage className="text-zinc-600" />
                             )}
                          </div>
                          <span className="font-semibold text-sm max-w-[200px] truncate" title={p.name}>{p.name}</span>
                        </td>
                        <td className="p-4 text-sm text-zinc-400">{p.mainGroup} / {p.subGroup}</td>
                        <td className="p-4 text-sm font-bold text-white">Rs {p.price}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleEditClick(p)}
                            className="inline-flex items-center text-xs font-bold bg-zinc-800 text-white px-3 py-1.5 rounded hover:bg-zinc-700 transition-colors"
                          >
                            <FiEdit2 className="mr-2" size={12} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- SALES & DISCOUNTS TAB --- */}
        {activeTab === 'sales' && (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Sale & Discount Manager</h1>
              <span className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded font-bold">{products.length} Items</span>
            </div>

            {status.message && (
              <div className={`p-4 mb-6 rounded text-sm font-semibold ${status.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                {status.message}
              </div>
            )}

            <div className="bg-[#18181b] rounded-lg border border-zinc-800 overflow-hidden shadow-lg">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-zinc-900 border-b border-zinc-800">
                  <tr>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Product Info</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Original Price</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Sale Price</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Discount</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-zinc-500 text-center">No products found.</td></tr>
                  ) : (
                    products.map(p => (
                      <tr key={p._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 flex items-center space-x-4">
                          <div className="w-10 h-10 bg-zinc-900 rounded border border-zinc-700 overflow-hidden flex-shrink-0">
                            {p.images && p.images.length > 0 ? (
                              <img src={`http://localhost:5000${p.images[0]}`} className="w-full h-full object-cover" alt="thumb" />
                            ) : (
                              <FiImage className="text-zinc-600 w-full h-full p-2" />
                            )}
                          </div>
                          <span className="font-semibold text-sm max-w-[200px] truncate">{p.name}</span>
                        </td>
                        <td className="p-4 text-sm text-zinc-400 font-bold">Rs {p.price}</td>
                        <td className="p-4">
                          <input 
                            type="number"
                            min="0"
                            defaultValue={p.discountPrice || ''}
                            placeholder={p.price}
                            className="w-24 bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded text-sm text-white focus:outline-none focus:border-zinc-500"
                            onBlur={(e) => {
                              const newPrice = Number(e.target.value);
                              if (newPrice > 0 && newPrice < p.price) {
                                const discount = Math.round(((p.price - newPrice) / p.price) * 100);
                                updateProductDiscount(p, newPrice, discount);
                              } else if (e.target.value === '' || newPrice === p.price) {
                                updateProductDiscount(p, 0, 0);
                              } else {
                                setStatus({ type: 'error', message: 'Sale price must be lower than original price' });
                              }
                            }}
                          />
                        </td>
                        <td className="p-4 text-sm font-bold text-green-400">
                          {p.discountPercentage ? `${p.discountPercentage}% OFF` : '0%'}
                        </td>
                        <td className="p-4 text-right text-xs text-zinc-500 italic">
                          Auto-saves on blur
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="max-w-7xl mx-auto">
            {!selectedOrder ? (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">Order Management</h1>
                  <span className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded font-bold">{orders.length} Orders</span>
                </div>

                <div className="bg-[#18181b] rounded-lg border border-zinc-800 overflow-hidden shadow-lg">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-zinc-900 border-b border-zinc-800">
                      <tr>
                        <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Order ID & Date</th>
                        <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Customer</th>
                        <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Total</th>
                        <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-zinc-500 text-center">No orders have been placed yet.</td></tr>
                      ) : (
                        orders.map(order => (
                          <tr key={order._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-sm text-white mb-1">#{order._id.substring(18).toUpperCase()}</p>
                              <p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-semibold text-zinc-300">{order.user?.name || 'Guest'}</p>
                              <p className="text-xs text-zinc-500 truncate max-w-[150px]">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                            </td>
                            <td className="p-4 text-sm font-bold text-white">Rs {order.totalPrice}</td>
                            <td className="p-4">
                              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                                order.status === 'Processing' ? 'bg-yellow-900/30 text-yellow-500 border border-yellow-900' :
                                order.status === 'Shipped' ? 'bg-blue-900/30 text-blue-400 border border-blue-900' :
                                order.status === 'Out for Delivery' ? 'bg-purple-900/30 text-purple-400 border border-purple-900' :
                                'bg-green-900/30 text-green-400 border border-green-900'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="inline-flex items-center text-xs font-bold bg-white text-black px-3 py-1.5 rounded hover:bg-zinc-200 transition-colors"
                              >
                                View Details <FiExternalLink className="ml-2" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in pb-12">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="flex items-center text-sm font-bold text-zinc-400 hover:text-white mb-6 transition-colors"
                >
                  <FiArrowLeft className="mr-2" /> Back to Orders List
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-white flex items-center">
                      Order #{selectedOrder._id.substring(18).toUpperCase()}
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center bg-[#18181b] border border-zinc-700 p-2 rounded-lg">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-3">Update Status:</span>
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                      className={`text-sm font-bold px-3 py-1.5 rounded outline-none cursor-pointer border ${
                        selectedOrder.status === 'Processing' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900' :
                        selectedOrder.status === 'Shipped' ? 'bg-blue-900/30 text-blue-400 border-blue-900' :
                        selectedOrder.status === 'Out for Delivery' ? 'bg-purple-900/30 text-purple-400 border-purple-900' :
                        'bg-green-900/30 text-green-400 border-green-900'
                      }`}
                    >
                      <option value="Processing" className="bg-zinc-900 text-white font-semibold">Processing</option>
                      <option value="Shipped" className="bg-zinc-900 text-white font-semibold">Shipped</option>
                      <option value="Out for Delivery" className="bg-zinc-900 text-white font-semibold">Out for Delivery</option>
                      <option value="Delivered" className="bg-zinc-900 text-white font-semibold">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 shadow-lg">
                      <h2 className="text-lg font-bold text-white mb-6 border-b border-zinc-800 pb-4">Items Ordered ({selectedOrder.orderItems.length})</h2>
                      <div className="space-y-4">
                        {selectedOrder.orderItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-zinc-800 rounded border border-zinc-700 overflow-hidden flex-shrink-0">
                                <img src={`http://localhost:5000${item.image}`} className="w-full h-full object-cover" alt="product"/>
                              </div>
                              <div>
                                <p className="text-white font-bold">{item.name}</p>
                                <p className="text-xs text-zinc-400 mt-1">Size: <span className="text-zinc-200 font-semibold">{item.size}</span></p>
                                <p className="text-xs text-zinc-400">Qty: <span className="text-zinc-200 font-semibold">{item.qty}</span></p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-white">Rs {item.price * item.qty}</p>
                              <p className="text-xs text-zinc-500">Rs {item.price} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 shadow-lg">
                      <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                        <FiMapPin className="mr-2 text-zinc-400" /> Customer & Shipping
                      </h2>
                      <div className="text-sm text-zinc-300 space-y-2 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                        <p className="font-bold text-white">{selectedOrder.user?.name || 'Guest User'}</p>
                        <p className="text-zinc-400">{selectedOrder.user?.email || 'No email provided'}</p>
                        <hr className="border-zinc-700 my-2" />
                        <p>{selectedOrder.shippingAddress.address}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                        <p className="font-bold">PIN: {selectedOrder.shippingAddress.postalCode}</p>
                      </div>
                    </div>

                    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 shadow-lg">
                      <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                        <FiCreditCard className="mr-2 text-zinc-400" /> Payment Details
                      </h2>
                      <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Method</span>
                          <span className="text-white font-bold">{selectedOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Payment Status</span>
                          <span className={`font-bold ${selectedOrder.isPaid ? 'text-green-400' : 'text-yellow-500'}`}>
                            {selectedOrder.isPaid ? 'Paid via Gateway' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-2 pt-2 border-t border-zinc-700">
                           <span className="text-zinc-500">Txn ID:</span>
                           <span className="text-zinc-500 italic">Will populate upon live Razorpay integration</span>
                        </div>
                        <hr className="border-zinc-700" />
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Items Total</span>
                          <span className="text-white">Rs {selectedOrder.itemsPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Shipping</span>
                          <span className="text-white">Rs {selectedOrder.shippingPrice}</span>
                        </div>
                        <div className="flex justify-between text-lg font-black pt-2">
                          <span className="text-white">Grand Total</span>
                          <span className="text-white">Rs {selectedOrder.totalPrice}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 shadow-lg">
                      <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                        <FiTruck className="mr-2 text-zinc-400" /> Logistics Hub
                      </h2>
                      <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50 text-center">
                        <p className="text-xs text-zinc-400 mb-3">Shiprocket Integration Pending</p>
                        <button 
                          disabled 
                          className="w-full bg-zinc-800 text-zinc-500 font-bold py-2 rounded border border-zinc-700 cursor-not-allowed"
                        >
                          Generate AWB & Label
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'form' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{editingId ? 'Edit Product Details' : 'Upload New Product'}</h1>
              {editingId && (
                <button onClick={resetForm} className="text-xs text-zinc-400 hover:text-white underline">Cancel Edit</button>
              )}
            </div>
            
            {status.message && (
              <div className={`p-4 mb-6 rounded text-sm font-semibold ${status.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                {status.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-[#18181b] p-8 rounded-lg border border-zinc-800 shadow-xl space-y-8">
              <div className="bg-zinc-900/50 p-6 rounded border border-dashed border-zinc-700">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Product Images</label>
                <input type="file" accept="image/*" multiple onChange={uploadMultipleFilesHandler} className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-white file:text-black hover:file:bg-zinc-200 transition-colors cursor-pointer mb-4" />
                {uploading && <p className="text-sm text-yellow-500 font-medium mb-4">Uploading files to server...</p>}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group aspect-square bg-zinc-900 rounded border border-zinc-700 overflow-hidden">
                        <img src={`http://localhost:5000${img}`} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-lg" title="Remove Image"><FiTrash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Product Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Detailed Description</label>
                  <textarea name="description" required rows="5" value={formData.description} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-colors leading-relaxed"></textarea>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Price (Rs)</label>
                    <input type="number" name="price" required min="0" value={formData.price} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-colors font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Main Group</label>
                    <select name="mainGroup" value={formData.mainGroup} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-colors">
                      {['NCC', 'Bihar Police', 'Security Guard', 'Indian Army'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Sub Group</label>
                    <select name="subGroup" value={formData.subGroup} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-colors">
                      {['Unassigned', 'Shirts', 'T-Shirts', 'Pants', 'Trousers', 'Accessories'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              
              <button type="submit" disabled={loading || uploading} className={`w-full font-black py-4 rounded-lg shadow-lg transition-colors mt-8 text-lg ${editingId ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white text-black hover:bg-zinc-200'} disabled:opacity-50`}>
                {loading ? 'Processing...' : (editingId ? 'Save Changes' : 'Publish Product')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;