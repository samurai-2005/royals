import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiPackage } from 'react-icons/fi';

// Helper: Normalizes hyphens, underscores, and extra spaces for matching
const normalize = (str) => (str || '').toLowerCase().replace(/[-_\s]+/g, ' ').trim();

const Category = () => {
  // Extract both 'type' (from App.jsx) and 'name' as fallback
  const params = useParams();
  const categoryParam = params.type || params.name || '';

  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
        
        const target = normalize(categoryParam);

        // If categoryParam is empty or 'all', show all items
        if (!categoryParam || target === 'all') {
          setProducts(data);
        } else {
          // Flexible normalized filter matching mainGroup or subGroup
          const filtered = data.filter(
            p => normalize(p.mainGroup) === target || 
                 normalize(p.subGroup) === target
          );
          setProducts(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [categoryParam]);

  // Replace hyphens with spaces for display title
  const formattedName = categoryParam.replace(/[-_]/g, ' ');
  const displayTitle = categoryParam && categoryParam.toLowerCase() !== 'all' 
    ? `${formattedName} Collection` 
    : 'All Uniforms';

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-220px)] flex items-center justify-center p-8 text-center text-zinc-500 font-medium">
        Loading catalog items...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-white pb-24 min-h-[calc(100vh-220px)] flex flex-col justify-between w-full">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black capitalize tracking-tight">{displayTitle}</h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">Showing {products.length} uniform items</p>
        </div>

        {products.length === 0 ? (
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 min-h-[350px] flex flex-col items-center justify-center space-y-3 shadow-xl">
            <FiPackage size={38} className="text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-400">
              No products currently available under this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
            {products.map((product) => {
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
                    {product.discountPercentage > 0 && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                        {product.discountPercentage}% OFF
                      </span>
                    )}

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
                        {product.mainGroup}
                      </span>
                      <h3 className="font-bold text-xs md:text-sm text-white line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                      <div>
                        <div className="text-sm md:text-base font-black text-white">
                          Rs {activePrice}
                        </div>
                        {product.discountPercentage > 0 && (
                          <div className="text-[10px] text-zinc-500 line-through font-semibold">
                            Rs {product.price}
                          </div>
                        )}
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
      </div>
    </div>
  );
};

export default Category;