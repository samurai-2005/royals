import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi'; // Imported the star icon

const ProductCard = ({ product }) => {
  const defaultImage = "https://via.placeholder.com/300x400/27272a/ffffff?text=No+Image";
  
  const displayImage = product.images && product.images.length > 0 
    ? `${import.meta.env.VITE_BACKEND_URL}${product.images[0]}` 
    : defaultImage;

  // Added fallbacks to 0 in case the database hasn't processed ratings yet
  const rating = product.rating || 0;
  const numReviews = product.numReviews || 0;

  return (
    <div className="bg-[#18181b] rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-500 transition-colors group">
      
      <Link to={`/product/${product._id}`} className="block relative h-64 overflow-hidden bg-zinc-900">
        <img 
          src={displayImage} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
            {product.discountPercentage}% OFF
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
        
        {/* NEW: Star Rating System */}
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
        
        <div className="mt-3 flex items-center justify-between">
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
            className="text-xs bg-white text-black font-bold py-1.5 px-3 rounded hover:bg-zinc-200 transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;