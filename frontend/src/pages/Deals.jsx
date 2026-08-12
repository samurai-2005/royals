import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiTag, FiShoppingBag, FiZap, FiCalendar } from 'react-icons/fi';

const Deals = () => {
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'individual'
  const [deals, setDeals] = useState([]);
  const [saleEvents, setSaleEvents] = useState([
    {
      _id: 'sale_1',
      title: 'Monsoon Uniform Blitz',
      banner: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80',
      discountPercentage: 15,
      startDate: '2026-08-10',
      endDate: '2026-08-20',
      isActive: true
    }
  ]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    const fetchDealsAndEvents = async () => {
      try {
        const [productsRes, salesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/sales`).catch(() => ({ data: [] }))
        ]);

        const discounted = (productsRes.data || []).filter(p => p.discountPercentage > 0);
        setDeals(discounted);

        if (Array.isArray(salesRes.data) && salesRes.data.length > 0) {
          setSaleEvents(salesRes.data.filter(s => s.isActive));
        }
      } catch (error) {
        console.error("Failed to fetch deals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDealsAndEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80 text-zinc-400 font-bold">
        Loading active offers...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto pb-24">
      {/* HEADER & DUAL-TAB TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-zinc-800 pb-4">
        <div className="flex items-center">
          <FiTag className="text-red-500 mr-3" size={28} />
          <h1 className="text-2xl md:text-3xl font-black text-white">Active Offers & Sales</h1>
        </div>

        <div className="flex items-center bg-[#18181b] border border-zinc-800 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'events' ? 'bg-amber-500 text-black font-black shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FiZap size={14} /> Sale Events ({saleEvents.length})
          </button>

          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'individual' ? 'bg-amber-500 text-black font-black shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FiTag size={14} /> Individual Deals ({deals.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: SALE EVENTS & CAMPAIGNS */}
      {activeTab === 'events' && (
        <div className="space-y-8">
          {saleEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500">
              <FiZap size={40} className="mb-2" />
              <p className="font-semibold">No active event campaigns right now.</p>
            </div>
          ) : (
            saleEvents.map((evt) => (
              <div key={evt._id} className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="relative h-48 md:h-64 overflow-hidden">
                  <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-[#18181b]/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-col md:flex-row md:items-end justify-between gap-2">
                    <div>
                      <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase shadow">
                        {evt.discountPercentage}% OFF STOREWIDE EVENT
                      </span>
                      <h2 className="text-xl md:text-3xl font-black text-white mt-1">{evt.title}</h2>
                    </div>
                    <div className="text-xs text-zinc-300 font-mono flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-lg border border-zinc-700 w-fit">
                      <FiCalendar size={12} /> {evt.startDate} to {evt.endDate}
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {deals.map(product => {
                    const rawImg = product.images?.[0] || product.image;
                    const imgUrl = getImageUrl(rawImg);

                    return (
                      <Link 
                        key={product._id} 
                        to={`/product/${product._id}`}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors group flex flex-col"
                      >
                        <div className="aspect-square bg-zinc-950 relative overflow-hidden">
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded z-10 shadow">
                            {product.discountPercentage}% OFF
                          </span>
                          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="p-3">
                          <h3 className="text-white font-bold text-xs truncate">{product.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-black text-white">Rs {product.discountPrice}</span>
                            <span className="text-[10px] font-bold text-zinc-500 line-through">Rs {product.price}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: INDIVIDUAL DEALS GRID */}
      {activeTab === 'individual' && (
        <div>
          {deals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-800 rounded-xl">
              <FiShoppingBag className="text-zinc-600 mb-4" size={48} />
              <p className="text-zinc-400 font-semibold">No individual item discounts right now. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {deals.map(product => {
                const rawImg = product.images?.[0] || product.image;
                const imgUrl = getImageUrl(rawImg);

                return (
                  <Link 
                    key={product._id} 
                    to={`/product/${product._id}`}
                    className="bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-500 transition-colors group relative flex flex-col shadow-lg"
                  >
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded z-10 shadow-lg">
                      {product.discountPercentage}% OFF
                    </div>
                    
                    <div className="aspect-square bg-zinc-900 overflow-hidden relative">
                      {imgUrl ? (
                        <img 
                          src={imgUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-bold uppercase tracking-widest">No Image</div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
                          {product.mainGroup} / {product.subGroup}
                        </span>
                        <h3 className="text-white font-bold text-sm truncate mb-2">{product.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">Rs {product.discountPrice}</span>
                        <span className="text-xs font-bold text-zinc-500 line-through">Rs {product.price}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Deals;