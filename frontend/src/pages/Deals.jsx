import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiTag, FiShoppingBag } from 'react-icons/fi';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        const discounted = data.filter(p => p.discountPercentage > 0);
        setDeals(discounted);
      } catch (error) {
        console.error("Failed to fetch deals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full text-zinc-400">Loading active offers...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto pb-24">
      <div className="flex items-center mb-8">
        <FiTag className="text-red-500 mr-3" size={28} />
        <h1 className="text-2xl md:text-3xl font-black text-white">Active Offers & Deals</h1>
      </div>

      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-800 rounded-xl">
          <FiShoppingBag className="text-zinc-600 mb-4" size={48} />
          <p className="text-zinc-400 font-semibold">No active sales right now. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {deals.map(product => (
            <Link 
              key={product._id} 
              to={`/product/${product._id}`}
              className="bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-500 transition-colors group relative flex flex-col shadow-lg"
            >
              <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded z-10 shadow-lg">
                {product.discountPercentage}% OFF
              </div>
              
              <div className="aspect-square bg-zinc-900 overflow-hidden relative">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={`http://localhost:5000${product.images[0]}`} 
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Deals;