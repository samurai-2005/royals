import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiGrid, 
  FiLayers, 
  FiEye,
  FiAward,
  FiShield,
  FiBookOpen,
  FiUserCheck,
  FiArrowRight
} from 'react-icons/fi';

const ORGS = [
  { id: 'School Uniforms', label: 'School Uniforms', icon: FiBookOpen },
  { id: 'NCC', label: 'NCC Cadets', icon: FiShield },
  { id: 'Security Guard', label: 'Security Guard', icon: FiUserCheck }
];

const Catalog = () => {
  const navigate = useNavigate();
  
  const [selectedOrg, setSelectedOrg] = useState('School Uniforms');
  const [activeMode, setActiveMode] = useState('sets'); // 'sets' or 'individual'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Catalog fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by selected organization
  const categoryProducts = products.filter(p => 
    p.mainGroup?.toLowerCase().includes(selectedOrg.toLowerCase())
  );

  // Divide into Uniform Sets and Loose Individual Component Items
  const uniformSets = categoryProducts.filter(p => p.subGroup === 'Set' || p.isSet);
  const individualProducts = categoryProducts.filter(p => p.subGroup !== 'Set' && !p.isSet);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-white pb-28 space-y-8 font-sans">
      
      {/* HEADER BAR */}
      <div className="border-b border-zinc-800/80 pb-6">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Uniform Directory
        </h1>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Official uniform packages and authentic component dress catalog.
        </p>
      </div>

      {/* 1. CATEGORY NAVIGATION TABS */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {ORGS.map((org) => {
          const Icon = org.icon;
          const isActive = selectedOrg === org.id;

          return (
            <button
              key={org.id}
              onClick={() => setSelectedOrg(org.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-xs md:text-sm whitespace-nowrap transition-all border cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black border-amber-500 shadow-lg shadow-amber-500/10 font-black scale-[1.02]' 
                  : 'bg-[#18181b] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Icon size={16} />
              <span>{org.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. DUAL MODE SWITCHER */}
      <div className="flex items-center bg-[#18181b] border border-zinc-800 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveMode('sets')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMode === 'sets' 
              ? 'bg-zinc-800 text-white shadow-md font-black' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FiLayers size={15} /> Official Sets ({uniformSets.length})
        </button>
        <button
          onClick={() => setActiveMode('individual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMode === 'individual' 
              ? 'bg-zinc-800 text-white shadow-md font-black' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FiGrid size={15} /> Individual Items ({individualProducts.length})
        </button>
      </div>

      {/* VIEW 1: UNIFORM SETS & BUNDLES */}
      {activeMode === 'sets' && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-16 text-center text-zinc-500 text-xs font-bold uppercase tracking-wider">
              Loading Official Uniform Sets...
            </div>
          ) : uniformSets.length === 0 ? (
            <div className="bg-[#18181b] border border-zinc-800 border-dashed rounded-3xl p-12 text-center space-y-3">
              <FiAward size={40} className="mx-auto text-zinc-600" />
              <h3 className="text-base font-bold text-white">No Uniform Sets Created Yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No ready-made sets have been published for {selectedOrg}. You can browse individual items below.
              </p>
              <button
                onClick={() => setActiveMode('individual')}
                className="text-xs text-amber-400 font-bold hover:underline inline-flex items-center gap-1 pt-2 cursor-pointer"
              >
                Browse Individual Components <FiArrowRight size={12} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniformSets.map((setItem) => {
                const activePrice = setItem.discountPrice > 0 ? setItem.discountPrice : setItem.price;
                const coverImg = setItem.images?.[0] || setItem.image;

                return (
                  <div 
                    key={setItem._id}
                    onClick={() => navigate(`/product/${setItem._id}`)}
                    className="bg-[#18181b] border border-zinc-800 rounded-3xl overflow-hidden p-5 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xl group space-y-4 cursor-pointer"
                  >
                    <div className="space-y-4">
                      {/* Set Cover Image */}
                      <div className="relative aspect-[4/3] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800/80 flex items-center justify-center group-hover:opacity-95 transition-opacity">
                        <span className="absolute top-3 left-3 bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow z-10 flex items-center gap-1">
                          <FiAward size={12} /> COMPLETE UNIFORM BUNDLE
                        </span>

                        {coverImg ? (
                          <img 
                            src={getImageUrl(coverImg)} 
                            alt={setItem.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="text-zinc-600 text-xs font-bold uppercase">No Cover Image</div>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">
                          {setItem.mainGroup}
                        </span>
                        <h3 className="text-base font-black text-white leading-snug group-hover:text-amber-400 transition-colors">
                          {setItem.name}
                        </h3>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{setItem.description}</p>
                      </div>
                    </div>

                    {/* BOTTOM SECTION: Pricing & Small View Button */}
                    <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Bundle Price</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-white">Rs {activePrice}</span>
                          {setItem.discountPrice > 0 && (
                            <span className="text-xs font-bold text-zinc-500 line-through">Rs {setItem.price}</span>
                          )}
                        </div>
                      </div>

                      <span className="bg-zinc-800 group-hover:bg-amber-500 group-hover:text-black text-zinc-200 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow">
                        View Set <FiArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: INDIVIDUAL COMPONENT ITEMS */}
      {activeMode === 'individual' && (
        <>
          {loading ? (
            <div className="p-16 text-center text-zinc-500 text-xs font-bold uppercase tracking-wider">
              Loading Individual Components...
            </div>
          ) : individualProducts.length === 0 ? (
            <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500">
              No individual items listed for {selectedOrg} yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {individualProducts.map((product) => {
                const rawImg = product.images && product.images.length > 0 ? product.images[0] : product.image;
                const imgUrl = getImageUrl(rawImg);
                const activePrice = product.discountPercentage > 0 ? product.discountPrice : product.price;

                return (
                  <div 
                    key={product._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all cursor-pointer group shadow-lg"
                  >
                    <div className="relative aspect-[4/5] bg-zinc-950 overflow-hidden flex items-center justify-center">
                      {imgUrl ? (
                        <img 
                          src={imgUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-xs text-zinc-600 font-bold uppercase">No Image</span>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1 truncate">
                          {product.subGroup}
                        </span>
                        <h3 className="font-bold text-xs md:text-sm text-white line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                        <div className="text-sm md:text-base font-black text-white">
                          Rs {activePrice}
                        </div>
                        <button className="bg-zinc-800 hover:bg-white hover:text-black text-zinc-300 p-2 rounded-xl transition-colors shadow">
                          <FiEye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Catalog;