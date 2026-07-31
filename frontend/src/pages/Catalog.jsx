import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { 
  FiCheckCircle, 
  FiGrid, 
  FiLayers, 
  FiShoppingBag, 
  FiEye,
  FiAward
} from 'react-icons/fi';

const ORGS = [
  { id: 'School', name: 'School Uniforms', icon: '🏫' },
  { id: 'NCC', name: 'NCC Cadets', icon: '🎖️' },
  { id: 'Bihar Police', name: 'Bihar Police', icon: '👮‍♂️' },
  { id: 'Security Guard', name: 'Security Guard', icon: '🛡️' },
  { id: 'Indian Army', name: 'Indian Army', icon: '🪖' }
];

// Pre-defined Kit Checklists for fast bundling
const DEFAULT_KITS = {
  School: [
    { id: 'shirt', name: 'Official Uniform Shirt', price: 450, mandatory: true },
    { id: 'bottom', name: 'Trousers / Pleated Skirt', price: 550, mandatory: true },
    { id: 'tie', name: 'School Crest Tie', price: 120, mandatory: false },
    { id: 'belt', name: 'Leather Belt with Logo Buckle', price: 150, mandatory: false },
    { id: 'socks', name: 'Cotton School Socks (Pair)', price: 80, mandatory: false },
    { id: 'blazer', name: 'Winter Blazer / Sweater', price: 1100, mandatory: false }
  ],
  NCC: [
    { id: 'ncc_dress', name: 'NCC Khaki Uniform Set', price: 1000, mandatory: true },
    { id: 'beret', name: 'NCC Navy Blue Beret Cap', price: 250, mandatory: true },
    { id: 'belt', name: 'NCC Web Belt & Buckle', price: 180, mandatory: true },
    { id: 'hackle', name: 'Regimental Hackle & Badge', price: 120, mandatory: false },
    { id: 'boots', name: 'D.M.S Ankle Boots', price: 950, mandatory: false }
  ]
};

const Catalog = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [selectedOrg, setSelectedOrg] = useState('School');
  const [activeMode, setActiveMode] = useState('kit'); // 'kit' or 'grid'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialized selected items from template directly (no useEffect state sync required)
  const [selectedKit, setSelectedKit] = useState(() => 
    (DEFAULT_KITS.School || []).map(item => item.id)
  );
  const [selectedSize, setSelectedSize] = useState('M');

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
        setProducts(data);
      } catch (err) {
        console.error("Catalog fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Clean state update handler when switching organizations
  const handleOrgChange = (orgId) => {
    setSelectedOrg(orgId);
    const kitTemplate = DEFAULT_KITS[orgId] || DEFAULT_KITS.School;
    setSelectedKit(kitTemplate.map(item => item.id));
  };

  const toggleKitItem = (itemId, isMandatory) => {
    if (isMandatory) return; // Cannot uncheck mandatory items
    if (selectedKit.includes(itemId)) {
      setSelectedKit(selectedKit.filter(id => id !== itemId));
    } else {
      setSelectedKit([...selectedKit, itemId]);
    }
  };

  const currentKitItems = DEFAULT_KITS[selectedOrg] || DEFAULT_KITS.School;
  const kitTotal = currentKitItems
    .filter(item => selectedKit.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const handleAddKitToCart = () => {
    const activeItems = currentKitItems.filter(item => selectedKit.includes(item.id));
    activeItems.forEach(item => {
      addToCart({
        _id: `kit_${item.id}_${Date.now()}`,
        name: `${selectedOrg} ${item.name}`,
        price: item.price,
        size: selectedSize,
        qty: 1,
        images: []
      });
    });
    navigate('/cart');
  };

  const filteredProducts = products.filter(p => 
    p.mainGroup?.toLowerCase() === selectedOrg.toLowerCase()
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-white pb-28">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight">Uniform Directory</h1>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Select an organization to browse individual components or assemble a complete kit set.
        </p>
      </div>

      {/* 1. ORGANIZATION MATRIX TABS */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
        {ORGS.map((org) => (
          <button
            key={org.id}
            onClick={() => handleOrgChange(org.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all border ${
              selectedOrg === org.id 
                ? 'bg-white text-black border-white shadow-lg' 
                : 'bg-[#18181b] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span>{org.icon}</span>
            <span>{org.name}</span>
          </button>
        ))}
      </div>

      {/* 2. DUAL MODE TOGGLE */}
      <div className="flex justify-between items-center bg-[#18181b] border border-zinc-800 p-1.5 rounded-xl mb-8 max-w-md">
        <button
          onClick={() => setActiveMode('kit')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeMode === 'kit' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FiLayers size={14} /> Complete Kit Builder
        </button>
        <button
          onClick={() => setActiveMode('grid')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeMode === 'grid' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FiGrid size={14} /> Individual Items ({filteredProducts.length})
        </button>
      </div>

      {/* 3A. INTERACTIVE KIT BUILDER VIEW */}
      {activeMode === 'kit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kit Checklist */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiAward className="text-yellow-500" /> {selectedOrg} Official Dress Checklist
                </h2>
                <span className="text-xs bg-zinc-800 px-2.5 py-1 rounded-full text-zinc-300 font-semibold">
                  {selectedKit.length} of {currentKitItems.length} Selected
                </span>
              </div>

              <div className="space-y-3">
                {currentKitItems.map((item) => {
                  const isChecked = selectedKit.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleKitItem(item.id, item.mandatory)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-zinc-900/80 border-zinc-700 text-white' 
                          : 'bg-[#0f0f0f] border-zinc-800 text-zinc-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-white text-black border-white' : 'border-zinc-700'
                        }`}>
                          {isChecked && <FiCheckCircle size={14} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{item.name}</p>
                          {item.mandatory && (
                            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                              Required Component
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-black text-sm text-white">Rs {item.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Kit Summary Card */}
          <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl shadow-xl h-fit space-y-6">
            <h3 className="text-lg font-bold border-b border-zinc-800 pb-3">Kit Configuration</h3>

            {/* Size Selector */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Select Uniform Size</label>
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                      selectedSize === size
                        ? 'bg-white text-black border-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-zinc-800" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Selected Items</span>
                <span className="text-white font-bold">{selectedKit.length} Items</span>
              </div>
              <div className="flex justify-between text-xl font-black text-white pt-2">
                <span>Bundle Total</span>
                <span>Rs {kitTotal}</span>
              </div>
            </div>

            <button
              onClick={handleAddKitToCart}
              className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <FiShoppingBag size={18} /> Add Complete Kit to Cart
            </button>
          </div>

        </div>
      )}

      {/* 3B. INDIVIDUAL CATALOG GRID VIEW */}
      {activeMode === 'grid' && (
        <>
          {loading ? (
            <div className="p-12 text-center text-zinc-500">Loading catalog items...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
              No individual items listed for {selectedOrg} yet. Try switching to the Complete Kit Builder!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map((product) => {
                const rawImg = product.images && product.images.length > 0 ? product.images[0] : product.image;
                const imgUrl = getImageUrl(rawImg);
                const activePrice = product.discountPercentage > 0 ? product.discountPrice : product.price;

                return (
                  <div 
                    key={product._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all cursor-pointer group shadow-md"
                  >
                    <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden flex items-center justify-center">
                      {imgUrl ? (
                        <img 
                          src={imgUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-xs text-zinc-600 font-bold">No Image</span>
                      )}
                    </div>

                    <div className="p-3 flex flex-col flex-1 justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1 truncate">
                          {product.subGroup}
                        </span>
                        <h3 className="font-bold text-xs md:text-sm text-white line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </div>

                      <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                        <div className="text-sm md:text-base font-black text-white">
                          Rs {activePrice}
                        </div>
                        <button className="bg-white text-black p-2 rounded-lg hover:bg-zinc-200 transition-colors shadow">
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