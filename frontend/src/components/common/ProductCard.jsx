import { Link } from 'react-router-dom';
import { FiStar, FiBell } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const defaultImage = "https://via.placeholder.com/300x400/27272a/ffffff?text=No+Image";
  
  // Dynamic Image Resolver
  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultImage;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const rawImage = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : product.image;

  const displayImage = getImageUrl(rawImage);

  const rating = product.rating || 0;
  const numReviews = product.numReviews || 0;
  const isOutOfStock = product.countInStock !== undefined ? product.countInStock <= 0 : !product.inStock;

  return (
    <div className="bg-[#18181b] rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-500 transition-colors group relative flex flex-col justify-between">
      
      <div>
        <Link to={`/product/${product._id}`} className="block relative h-64 overflow-hidden bg-zinc-900">
          <img 
            src={displayImage} 
            alt={product.name} 
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isOutOfStock ? 'opacity-60 grayscale' : ''
            }`}
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />

          {/* Discount Badge */}
          {product.discountPercentage > 0 && !isOutOfStock && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
              {product.discountPercentage}% OFF
            </span>
          )}

          {/* Out of Stock Overlay Badge */}
          {isOutOfStock && (
            <span className="absolute top-2 left-2 bg-zinc-900/90 border border-red-500/40 text-red-400 text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg">
              Out of Stock
            </span>
          )}
        </Link>

        <div className="p-4">
          <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">
            {product.mainGroup} {product.subGroup !== 'Unassigned' ? `- ${product.subGroup}` : ''}
          </div>
          <Link to={`/product/${product._id}`}>
            <h3 className="text-sm font-semibold text-white truncate hover:text-gray-300 transition-colors">
              {product.name}
            </h3>
          </Link>
          
          {/* Star Rating System */}
          <div className="flex items-center mt-1.5 mb-2">
            <div className="flex text-yellow-500 text-xs">
              {[...Array(5)].map((_, i) => (
                <FiStar 
                  key={i} 
                  fill={i < Math.round(rating) ? 'currentColor' : 'none'} 
                  className="mr-0.5" 
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-zinc-500 ml-1 mt-0.5">({numReviews})</span>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="mt-3 flex items-center justify-between border-t border-zinc-800/80 pt-3">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className="text-xs line-through text-zinc-500">Rs {product.price}</span>
                <span className="text-md font-bold text-green-400">Rs {product.discountPrice}</span>
              </>
            ) : (
              <span className="text-md font-bold text-white">Rs {product.price}</span>
            )}
          </div>

          <Link 
            to={`/product/${product._id}`}
            className={`text-xs font-bold py-1.5 px-3 rounded transition-colors flex items-center gap-1 ${
              isOutOfStock 
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isOutOfStock ? <><FiBell size={12} /> Notify</> : 'View'}
          </Link>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;