import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiImage, FiPlus } from 'react-icons/fi';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // Defaulting to inventory for faster workflow
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Added 'images' as an array and an 'editingId' to track if we are updating or creating
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
    // Define the fetch function inside the effect
    const fetchInventory = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch inventory", error); 
      }
    };

    // Call it immediately if the tab is correct
    if (activeTab === 'inventory') {
      fetchInventory();
    }
  }, [activeTab]);
  // Handle Text Inputs
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle MULTIPLE Image Uploads
  const uploadMultipleFilesHandler = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      
      // Upload all selected files in parallel
      const uploadPromises = files.map(file => {
        const fileData = new FormData();
        fileData.append('image', file);
        return axios.post('http://localhost:5000/api/upload', fileData, config);
      });

      const responses = await Promise.all(uploadPromises);
      const newImagePaths = responses.map(res => res.data);

      // Append new images to the existing images array
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImagePaths] }));
      setUploading(false);
    } catch (error) {
      console.error("Failed to upload images", error);
      setUploading(false);
    }
  };

  // Remove a specific image from the preview
  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Load Product into Form for Editing
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

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', mainGroup: 'NCC', subGroup: 'Unassigned', images: [] });
    setStatus({ type: '', message: '' });
  };

  // Submit Product (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      let response;
      if (editingId) {
        // UPDATE existing product
        response = await axios.put(`http://localhost:5000/api/products/${editingId}`, formData, config);
        setStatus({ type: 'success', message: `Successfully updated: ${response.data.name}` });
      } else {
        // CREATE new product
        response = await axios.post('http://localhost:5000/api/products', formData, config);
        setStatus({ type: 'success', message: `Successfully created: ${response.data.name}` });
      }
      
      resetForm();
      setActiveTab('inventory'); // Route back to inventory to see the changes
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Error saving product' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    // Locked to Desktop layout: flex-row, no responsive stacking classes
    <div className="flex flex-row h-full bg-[#0f0f0f] text-white overflow-hidden">
      
      {/* Slimmer Sidebar to maximize workspace (w-52) */}
      <div className="w-52 flex-shrink-0 bg-[#18181b] border-r border-zinc-800 p-5 flex flex-col z-10 shadow-xl">
        <h2 className="text-sm font-black text-white mb-8 tracking-widest uppercase">Admin Hub</h2>
        
        <div className="flex flex-col space-y-2">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`text-left px-4 py-3 rounded text-sm transition-colors ${activeTab === 'inventory' ? 'bg-zinc-800 font-bold text-white shadow-inner' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            Inventory Stock
          </button>
          <button 
            onClick={() => { resetForm(); setActiveTab('form'); }}
            className={`text-left px-4 py-3 rounded text-sm transition-colors flex items-center justify-between ${activeTab === 'form' ? 'bg-zinc-800 font-bold text-white shadow-inner' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <span>{editingId ? 'Edit Product' : 'Add Product'}</span>
            {!editingId && <FiPlus />}
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

      {/* Massive Workspace Area */}
      <div className="flex-1 p-8 overflow-y-auto bg-zinc-950">
        
        {/* --- INVENTORY TAB --- */}
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

        {/* --- FORM TAB (ADD / EDIT) --- */}
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
              
              {/* IMAGE UPLOAD SECTION */}
              <div className="bg-zinc-900/50 p-6 rounded border border-dashed border-zinc-700">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Product Images</label>
                
                <input 
                  type="file" 
                  accept="image/*"
                  multiple // ALLOWS MULTIPLE FILES
                  onChange={uploadMultipleFilesHandler}
                  className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-white file:text-black hover:file:bg-zinc-200 transition-colors cursor-pointer mb-4"
                />
                
                {uploading && <p className="text-sm text-yellow-500 font-medium mb-4">Uploading files to server...</p>}
                
                {/* Image Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group aspect-square bg-zinc-900 rounded border border-zinc-700 overflow-hidden">
                        <img src={`http://localhost:5000${img}`} alt={`Preview ${index}`} className="w-full h-full object-cover" />
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
                {formData.images.length === 0 && !uploading && (
                  <p className="text-xs text-zinc-500 italic">No images uploaded yet.</p>
                )}
              </div>

              {/* DETAILS SECTION */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Product Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-colors" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Detailed Description</label>
                  <textarea 
                    name="description" 
                    required 
                    rows="5" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-colors leading-relaxed"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Price (Rs)</label>
                    <input 
                      type="number" 
                      name="price" 
                      required 
                      min="0"
                      value={formData.price} 
                      onChange={handleChange} 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-colors font-bold" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Main Group</label>
                    <select 
                      name="mainGroup" 
                      value={formData.mainGroup} 
                      onChange={handleChange} 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                    >
                      {['NCC', 'Bihar Police', 'Security Guard', 'Indian Army'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Sub Group</label>
                    <select 
                      name="subGroup" 
                      value={formData.subGroup} 
                      onChange={handleChange} 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                    >
                      {['Unassigned', 'Shirts', 'T-Shirts', 'Pants', 'Trousers', 'Accessories'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || uploading} 
                className={`w-full font-black py-4 rounded-lg shadow-lg transition-colors mt-8 text-lg ${
                  editingId 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-white text-black hover:bg-zinc-200'
                } disabled:opacity-50`}
              >
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