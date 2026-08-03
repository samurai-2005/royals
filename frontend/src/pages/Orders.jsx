import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiPackage, 
  FiArrowLeft, 
  FiClock, 
  FiTruck, 
  FiCheckCircle 
} from 'react-icons/fi';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    const userInfoString = localStorage.getItem('userInfo');
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;

    if (!userInfo || !userInfo.token) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/orders/myorders`,
          config
        );
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(err.response?.data?.message || 'Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-220px)] text-white p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      
      {/* Header & Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/user-profile')}
            className="flex items-center gap-2 bg-[#18181b] border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <FiArrowLeft size={16} /> Back to Profile
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide">
              Order History
            </h1>
            <p className="text-xs text-zinc-400">Track and review your past uniform purchases</p>
          </div>
        </div>

        {orders.length > 0 && (
          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full w-fit">
            {orders.length} Total Orders
          </span>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-zinc-400 font-medium">Loading your orders...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-950/40 border border-red-800/60 p-4 rounded-2xl text-red-400 text-xs text-center font-medium">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 min-h-[350px] flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-600">
            <FiPackage size={42} />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-300">No Orders Found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              You haven't placed any orders yet. Explore our uniform directory to get started!
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/catalog')}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer shadow-lg"
          >
            Browse Uniform Directory
          </button>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPaid = order.isPaid;
            const isDelivered = order.isDelivered;

            return (
              <div
                key={order._id}
                className="bg-[#18181b] border border-zinc-800/80 rounded-2xl p-5 md:p-6 shadow-xl space-y-4 hover:border-zinc-700 transition-colors"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block">
                      Order Reference
                    </span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Payment Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                        isPaid
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
                          : 'bg-amber-950/80 text-amber-400 border-amber-800/80'
                      }`}
                    >
                      {isPaid ? <FiCheckCircle size={12} /> : <FiClock size={12} />}
                      {isPaid ? 'Paid' : 'Payment Pending'}
                    </span>

                    {/* Delivery Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                        isDelivered
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
                          : 'bg-blue-950/80 text-blue-400 border-blue-800/80'
                      }`}
                    >
                      <FiTruck size={12} />
                      {isDelivered ? 'Delivered' : 'Processing / In Transit'}
                    </span>
                  </div>
                </div>

                {/* Ordered Items Grid */}
                <div className="divide-y divide-zinc-800/60">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 bg-zinc-950 rounded-xl border border-zinc-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiPackage className="text-zinc-600" size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Qty: <strong className="text-zinc-200">{item.qty}</strong> × Rs {item.price}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-black text-white flex-shrink-0">
                        Rs {item.qty * item.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer Summary */}
                <div className="border-t border-zinc-800/80 pt-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-500 font-medium">Placed on: </span>
                    <span className="text-zinc-300 font-semibold">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-zinc-400 text-[11px] block">Total Amount</span>
                    <span className="text-base font-black text-white">
                      Rs {order.totalPrice || order.itemsPrice}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Orders;