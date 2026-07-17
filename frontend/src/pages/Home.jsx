import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-8 text-zinc-400 flex justify-center items-center h-full">Loading catalog...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Featured Catalog</h1>
      
      {products.length === 0 ? (
        <p className="text-zinc-500">No products available yet. Admin needs to upload inventory!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product._id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col hover:border-zinc-600 transition-colors">
              
              {/* Product Image Area */}
              <div className="h-56 bg-[#18181b] flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={`http://localhost:5000${product.images[0]}`} 
                    alt={product.name} 
                    className="object-cover h-full w-full" 
                  />
                ) : (
                  <span className="text-zinc-600 text-sm">No Image</span>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white mb-1 truncate" title={product.name}>
                  {product.name}
                </h3>
                <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider font-semibold">
                  {product.mainGroup} - {product.subGroup}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <p className="text-xl font-bold text-white">Rs {product.price}</p>
                  <Link 
                    to={`/product/${product._id}`} 
                    className="bg-white text-black text-xs font-bold px-4 py-2 rounded hover:bg-zinc-200 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;