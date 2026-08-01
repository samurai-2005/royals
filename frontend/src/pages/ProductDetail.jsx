import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingBag, FiTruck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Helper function to handle Cloudinary HTTPS links and fallback URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/500x500/18181b/ffffff?text=No+Image';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="flex justify-center items-center h-96 text-zinc-500">
        Loading Product Details...
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Product Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden relative">
            <img 
              src={getImageUrl(images[selectedImage])} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase shadow-lg">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl bg-[#18181b] border-2 overflow-hidden flex-shrink-0 transition-all ${
                    selectedImage === idx ? 'border-white scale-95' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(img)} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Add to Cart */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                {product.mainGroup}
              </span>
              <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                {product.subGroup}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white">{product.name}</h1>
            
            <div className="flex items-center gap-3 mt-3">
              {product.discountPrice > 0 ? (
                <>
                  <span className="text-2xl font-black text-white">Rs {product.discountPrice}</span>
                  <span className="text-sm font-bold text-zinc-500 line-through">Rs {product.price}</span>
                </>
              ) : (
                <span className="text-2xl font-black text-white">Rs {product.price}</span>
              )}
            </div>
          </div>

          {/* Delivery Availability Checker */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-4">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center mb-2">
              <FiTruck className="mr-2" /> Check Delivery Availability
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 flex-1"
              />
              <button 
                onClick={() => setPincodeStatus(pincode.length === 6 ? 'Deliverable to your area in 3-5 days' : 'Invalid Pincode')}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Check
              </button>
            </div>
            {pincodeStatus && <p className="text-xs text-green-400 font-semibold mt-2">{pincodeStatus}</p>}
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed">{product.description}</p>

          {/* Size Selector */}
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Select Size</h3>
            <div className="flex gap-3">
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-xl font-bold text-sm border transition-all flex items-center justify-center ${
                    selectedSize === size
                      ? 'bg-white text-black border-white shadow-lg'
                      : 'bg-[#18181b] text-zinc-400 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => addToCart({ ...product, size: selectedSize })}
            className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg text-base"
          >
            <FiShoppingBag size={20} /> Add to Cart
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;