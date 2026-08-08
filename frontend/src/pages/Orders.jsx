import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiPackage, 
  FiArrowLeft, 
  FiClock, 
  FiTruck, 
  FiCheckCircle,
  FiXCircle,
  FiRotateCcw,
  FiSearch
} from 'react-icons/fi';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reload trigger state to re-fetch orders after actions
  const [reload, setReload] = useState(0);

  // Action Loading States
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchMyOrders = async () => {
      const userInfoString = localStorage.getItem('userInfo');
      const userInfo = userInfoString ? JSON.parse(userInfoString) : null;

      if (!userInfo || !userInfo.token) {
        navigate('/login');
        return;
      }

      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/myorders`, config);
        
        if (isMounted) {
          setOrders(data);
          setError('');
        }
      } catch (err) {
        console.error('Fetch orders error:', err);
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load order history.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMyOrders();

    return () => {
      isMounted = false;
    };
  }, [navigate, reload]);

  // Live Tracking Action
  const handleTrackOrder = async (awbCode) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    setActionLoadingId(awbCode);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/logistics/track/${awbCode}`, config);
      setTrackingInfo(data.tracking);
    } catch (err) {
      console.error('Track order error:', err);
      alert('Could not fetch real-time tracking data.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Self-Service Cancellation
  const handleCancelOrder = async (mongoOrderId, shiprocketOrderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    setActionLoadingId(mongoOrderId);

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/logistics/cancel-order`, {
        mongoOrderId,
        shiprocketOrderId
      }, config);

      alert('Order cancelled successfully.');
      setReload((prev) => prev + 1);
    } catch (err) {
      console.error('Cancel order error:', err);
      alert('Failed to cancel order.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Return / Exchange Action
  const handleRequestReturn = async (order) => {
    if (!window.confirm('Schedule a reverse return pickup for this delivered order?')) return;

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    setActionLoadingId(order._id);

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/logistics/create-return`, {
        orderId: order._id,
        orderItems: order.orderItems,
        shippingAddress: order.shippingAddress,
        user: userInfo
      }, config);

      alert('Return pickup scheduled! Courier will collect package from your doorstep.');
      setReload((prev) => prev + 1);
    } catch (err) {
      console.error('Request return error:', err);
      alert('Failed to schedule return.');
    } finally {
      setActionLoadingId(null);
    }
  };

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
            <p className="text-xs text-zinc-400">Track and review your past purchases</p>
          </div>
        </div>

        {orders.length > 0 && (
          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full w-fit">
            {orders.length} Total Orders
          </span>
        )}
      </div>

      {loading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-zinc-400 font-medium">Loading your orders...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-950/40 border border-red-800/60 p-4 rounded-2xl text-red-400 text-xs text-center font-medium">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 min-h-[350px] flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-600">
            <FiPackage size={42} />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-300">No Orders Found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              You haven't placed any orders yet. Explore our directory to get started!
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/catalog')}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer shadow-lg"
          >
            Browse Directory
          </button>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPaid = order.isPaid;
            const isDelivered = order.isDelivered;
            const isCancelled = order.status === 'Cancelled';
            const isReturnRequested = order.status === 'Return Requested';

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

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                        isCancelled
                          ? 'bg-red-950/80 text-red-400 border-red-800/80'
                          : isReturnRequested
                          ? 'bg-purple-950/80 text-purple-400 border-purple-800/80'
                          : isDelivered
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
                          : 'bg-blue-950/80 text-blue-400 border-blue-800/80'
                      }`}
                    >
                      <FiTruck size={12} />
                      {order.status || (isDelivered ? 'Delivered' : 'Processing / Shipped')}
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

                {/* Action Toolbar */}
                <div className="border-t border-zinc-800/80 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
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

                  <div className="flex items-center gap-2">
                    {/* Live Tracking Button */}
                    {order.awbCode && (
                      <button
                        onClick={() => handleTrackOrder(order.awbCode)}
                        disabled={actionLoadingId === order.awbCode}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-3 py-1.5 rounded-lg border border-zinc-700 flex items-center gap-1"
                      >
                        <FiSearch /> {actionLoadingId === order.awbCode ? 'Loading...' : 'Track Package'}
                      </button>
                    )}

                    {/* Cancel Order Button */}
                    {!isDelivered && !isCancelled && !isReturnRequested && (
                      <button
                        onClick={() => handleCancelOrder(order._id, order.shiprocketOrderId)}
                        disabled={actionLoadingId === order._id}
                        className="bg-red-950/60 hover:bg-red-900/80 text-red-400 font-bold px-3 py-1.5 rounded-lg border border-red-800/80 flex items-center gap-1"
                      >
                        <FiXCircle /> {actionLoadingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}

                    {/* Return Request Button */}
                    {isDelivered && !isReturnRequested && (
                      <button
                        onClick={() => handleRequestReturn(order)}
                        disabled={actionLoadingId === order._id}
                        className="bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 font-bold px-3 py-1.5 rounded-lg border border-purple-800/80 flex items-center gap-1"
                      >
                        <FiRotateCcw /> Return / Exchange
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Tracking Modal */}
      {trackingInfo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FiTruck className="text-amber-400" /> Package Tracking
            </h3>
            <pre className="bg-zinc-950 p-4 rounded-xl text-xs overflow-x-auto text-zinc-300 max-h-60">
              {JSON.stringify(trackingInfo, null, 2)}
            </pre>
            <button
              onClick={() => setTrackingInfo(null)}
              className="w-full bg-white text-black font-bold py-2 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;