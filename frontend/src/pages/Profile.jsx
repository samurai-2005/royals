import { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    name: '', 
    description: '', 
    price: '', 
    mainGroup: 'NCC', 
    subGroup: 'Unassigned', 
    image: ''
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Fetch Inventory for the Dashboard
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setProducts(data);
      } catch (error) {
        // FIXED: Using the error variable to clear the ESLint warning
        console.error("Failed to fetch inventory", error); 
      }
    };
    if (activeTab === 'inventory') fetchInventory();
  }, [activeTab]);

  // Handle Form Inputs
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle Image Upload
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const fileData = new FormData();
    fileData.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('http://localhost:5000/api/upload', fileData, config);
      setFormData({ ...formData, image: data });
      setUploading(false);
    } catch (error) {
      console.error("Failed to upload image", error);
      setUploading(false);
    }
  };

  // Submit Product to Database
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const payload = { ...formData, images: formData.image ? [formData.image] : [] };
      const { data } = await axios.post('http://localhost:5000/api/products', payload, config);
      
      setStatus({ type: 'success', message: `Successfully uploaded: ${data.name}` });
      setFormData({ name: '', description: '', price: '', mainGroup: 'NCC', subGroup: 'Unassigned', image: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Error uploading' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-[#0f0f0f] text-white">
      {/* Dashboard Sidebar */}
      <div className="w-64 bg-[#18181b] border-r border-zinc-800 p-6 flex flex-col space-y-4">
        <h2 className="text-lg font-bold text-white mb-4 tracking-wider">MERCHANT HUB</h2>
        <button 
          onClick={() => setActiveTab('overview')}
          className={`text-left px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-zinc-800 font-bold' : 'text-zinc-400 hover:text-white transition-colors'}`}
        >
          System Overview
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`text-left px-4 py-2 rounded ${activeTab === 'inventory' ? 'bg-zinc-800 font-bold' : 'text-zinc-400 hover:text-white transition-colors'}`}
        >
          Inventory Stock
        </button>
        <button 
          onClick={() => setActiveTab('add')}
          className={`text-left px-4 py-2 rounded ${activeTab === 'add' ? 'bg-zinc-800 font-bold' : 'text-zinc-400 hover:text-white transition-colors'}`}
        >
          + Add New Product
        </button>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {activeTab === 'overview' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Overview</h1>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-zinc-900 p-6 rounded border border-zinc-800">
                <p className="text-zinc-500 text-sm font-bold uppercase">Total Revenue (MVP)</p>
                <p className="text-3xl font-bold mt-2 text-white">Rs 0.00</p>
              </div>
              <div className="bg-zinc-900 p-6 rounded border border-zinc-800">
                <p className="text-zinc-500 text-sm font-bold uppercase">Active Orders</p>
                <p className="text-3xl font-bold mt-2 text-white">0</p>
              </div>
              <div className="bg-zinc-900 p-6 rounded border border-zinc-800">
                <p className="text-zinc-500 text-sm font-bold uppercase">Bulk Inquiries</p>
                <p className="text-3xl font-bold mt-2 text-white">0</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Inventory Stock</h1>
            <div className="bg-zinc-900 rounded border border-zinc-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-800 border-b border-zinc-700">
                  <tr>
                    <th className="p-4 text-sm font-bold text-zinc-400 uppercase">Product</th>
                    <th className="p-4 text-sm font-bold text-zinc-400 uppercase">Group</th>
                    <th className="p-4 text-sm font-bold text-zinc-400 uppercase">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-4 text-zinc-500 text-center">No products found in inventory.</td>
                    </tr>
                  ) : (
                    products.map(p => (
                      <tr key={p._id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                        <td className="p-4 text-sm">{p.name}</td>
                        <td className="p-4 text-sm">{p.mainGroup} - {p.subGroup}</td>
                        <td className="p-4 text-sm">Rs {p.price}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Upload Product</h1>
            
            {status.message && (
              <div className={`p-4 mb-6 rounded text-sm font-semibold ${status.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                {status.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5 bg-zinc-900 p-6 rounded border border-zinc-800">
              
              {/* Image Upload Section */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Product Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={uploadFileHandler}
                  className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 transition-colors cursor-pointer"
                />
                {uploading && <p className="text-sm text-yellow-500 mt-2 font-medium">Uploading image...</p>}
                {formData.image && <p className="text-sm text-green-400 mt-2 font-medium">Image successfully attached.</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Product Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full bg-[#18181b] border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-zinc-500 transition-colors" 
                  placeholder="e.g., Standard NCC Uniform Shirt"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  name="description" 
                  required 
                  rows="3" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="w-full bg-[#18181b] border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                  placeholder="Detailed description of fabric, fit, and regulations..."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Price (Rs)</label>
                  <input 
                    type="number" 
                    name="price" 
                    required 
                    min="0"
                    value={formData.price} 
                    onChange={handleChange} 
                    className="w-full bg-[#18181b] border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-zinc-500 transition-colors" 
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Main Group</label>
                  <select 
                    name="mainGroup" 
                    value={formData.mainGroup} 
                    onChange={handleChange} 
                    className="w-full bg-[#18181b] border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-zinc-500 transition-colors"
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
                    className="w-full bg-[#18181b] border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                  >
                    {['Unassigned', 'Shirts', 'T-Shirts', 'Pants', 'Trousers', 'Accessories'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || uploading} 
                className="w-full bg-white text-black font-bold py-3 rounded hover:bg-zinc-200 transition-colors mt-6 disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Publish to Catalog'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;