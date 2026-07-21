import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUser, 
  FiPackage, 
  FiSettings, 
  FiFileText, 
  FiLogOut, 
  FiChevronRight, 
  FiShield,
  FiEdit2,
  FiLoader
} from 'react-icons/fi';

const UserProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [activeView, setActiveView] = useState('menu');
  const [uploading, setUploading] = useState(false);
  
  // Real Order States
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const userInfoString = localStorage.getItem('userInfo');
  const [user, setUser] = useState(
    userInfoString ? JSON.parse(userInfoString) : { name: 'Guest User', email: 'guest@example.com', token: null }
  );

  // Fetch real orders when the "orders" tab is opened
  useEffect(() => {
    if (activeView === 'orders' && user?.token) {
      const fetchMyOrders = async () => {
        setLoadingOrders(true);
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
          setOrders(data);
        } catch (error) {
          console.error("Failed to fetch orders", error);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchMyOrders();
    }
  }, [activeView, user]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // Handle Profile Picture Upload
  const uploadProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileData = new FormData();
      fileData.append('image', file);
      
      const uploadConfig = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data: imagePath } = await axios.post('http://localhost:5000/api/upload', fileData, uploadConfig);

      const userConfig = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      
      const { data: updatedUser } = await axios.put(
        'http://localhost:5000/api/users/profile', 
        { profilePicture: imagePath }, 
        userConfig
      );

      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const renderMenu = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-2">Account</h2>
        <div className="bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden">
          <button onClick={() => setActiveView('edit')} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50">
            <div className="flex items-center text-white"><FiUser className="mr-3 text-zinc-400" size={18} /> Edit Profile</div>
            <FiChevronRight className="text-zinc-600" />
          </button>
          <button onClick={() => setActiveView('orders')} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50">
            <div className="flex items-center text-white"><FiPackage className="mr-3 text-zinc-400" size={18} /> Order History</div>
            <FiChevronRight className="text-zinc-600" />
          </button>
          <button onClick={() => setActiveView('settings')} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center text-white"><FiSettings className="mr-3 text-zinc-400" size={18} /> Settings</div>
            <FiChevronRight className="text-zinc-600" />
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-2">Legal Policies</h2>
        <div className="bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden">
          <Link to="/terms" className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50">
            <div className="flex items-center text-zinc-300"><FiFileText className="mr-3 text-zinc-500" size={18} /> Terms and Conditions</div>
            <FiChevronRight className="text-zinc-600" />
          </Link>
          <Link to="/privacy" className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50">
            <div className="flex items-center text-zinc-300"><FiShield className="mr-3 text-zinc-500" size={18} /> Privacy Policy</div>
            <FiChevronRight className="text-zinc-600" />
          </Link>
          <Link to="/refund-policy" className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50">
            <div className="flex items-center text-zinc-300"><FiFileText className="mr-3 text-zinc-500" size={18} /> Cancellation and Refund Policy</div>
            <FiChevronRight className="text-zinc-600" />
          </Link>
          <Link to="/shipping-policy" className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center text-zinc-300"><FiPackage className="mr-3 text-zinc-500" size={18} /> Shipping and Delivery Policy</div>
            <FiChevronRight className="text-zinc-600" />
          </Link>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center p-4 bg-red-900/10 border border-red-900/30 text-red-500 rounded-xl font-bold hover:bg-red-900/20 transition-colors mt-8"
      >
        <FiLogOut className="mr-2" size={18} /> Secure Logout
      </button>

    </div>
  );

  const renderOrders = () => (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Order History</h2>
        <button onClick={() => setActiveView('menu')} className="text-sm text-zinc-400 hover:text-white md:hidden">Back</button>
      </div>
      
      {loadingOrders ? (
        <div className="flex justify-center items-center h-32 text-zinc-400">
          <FiLoader className="animate-spin mr-2" size={20} /> Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
          You haven't placed any orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-[#18181b] border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-white font-bold mb-1">#{order._id.substring(18).toUpperCase()}</p>
                <p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                <div className="text-xs text-zinc-400 mt-2">
                  {order.orderItems.map((item, index) => (
                    <span key={index}>
                      {item.name} (x{item.qty}){index < order.orderItems.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-left md:text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
                <p className="text-white font-bold mb-1">Rs {order.totalPrice}</p>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded mt-1 ${
                  order.status === 'Processing' ? 'bg-yellow-900/30 text-yellow-500' :
                  order.status === 'Shipped' ? 'bg-blue-900/30 text-blue-400' :
                  order.status === 'Out for Delivery' ? 'bg-purple-900/30 text-purple-400' :
                  'bg-green-900/30 text-green-400'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEditProfile = () => (
    <div className="animate-fade-in">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
        <button onClick={() => setActiveView('menu')} className="text-sm text-zinc-400 hover:text-white md:hidden">Back</button>
      </div>
      <form className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
          <input type="text" defaultValue={user.name} className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
          <input type="email" defaultValue={user.email} className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-zinc-400 cursor-not-allowed" disabled />
          <p className="text-[10px] text-zinc-500 mt-1">Email cannot be changed.</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Phone Number</label>
          <input type="tel" placeholder="+91" className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-zinc-500" />
        </div>
        <button type="button" className="w-full bg-white text-black font-bold py-3 rounded-lg mt-4 hover:bg-zinc-200 transition-colors">
          Save Changes
        </button>
      </form>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto h-full overflow-y-auto pb-24 md:pb-8">
      
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={uploadProfilePicture} 
        className="hidden" 
      />

      {/* Profile Header */}
      <div className="flex items-center space-x-5 mb-8 md:mb-12">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-800 border-2 border-zinc-700 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden group">
          
          {uploading ? (
            <FiLoader size={24} className="text-white animate-spin" />
          ) : user.profilePicture ? (
            <img src={`http://localhost:5000${user.profilePicture}`} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <FiUser size={32} className="text-zinc-400" />
          )}

          <button 
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white transition-all cursor-pointer z-10"
            title="Change Profile Picture"
          >
            <FiEdit2 size={20} />
          </button>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{user.name}</h1>
          <p className="text-sm text-zinc-400">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className={`w-full md:w-1/3 flex-shrink-0 ${activeView !== 'menu' ? 'hidden md:block' : 'block'}`}>
          {renderMenu()}
        </div>

        <div className={`w-full md:w-2/3 ${activeView === 'menu' ? 'hidden md:block' : 'block'}`}>
          {activeView === 'menu' && (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl p-12 text-center">
              <FiUser size={48} className="mb-4 text-zinc-700" />
              <p>Select an option from the menu to view details.</p>
            </div>
          )}
          {activeView === 'orders' && renderOrders()}
          {activeView === 'edit' && renderEditProfile()}
          {activeView === 'settings' && (
             <div className="animate-fade-in">
               <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">App Settings</h2>
                <button onClick={() => setActiveView('menu')} className="text-sm text-zinc-400 hover:text-white md:hidden">Back</button>
              </div>
               <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 text-zinc-400 text-sm">
                 Settings toggles (Notifications, Dark Mode) will go here.
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;