import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiSearch } from 'react-icons/fi';

const Search = () => {
  const { keyword } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        
        // Frontend filtering: Checks if the keyword matches the product name, main group, or sub group
        const filtered = data.filter(p => 
          p.name.toLowerCase().includes(keyword.toLowerCase()) || 
          p.mainGroup.toLowerCase().includes(keyword.toLowerCase()) || 
          p.subGroup.toLowerCase().includes(keyword.toLowerCase())
        );
        
        setProducts(filtered);
      } catch (error) {
        console.error("Error fetching search results", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndFilterProducts();
  }, [keyword]);

  if (loading) {
    return <div className="p-8 text-zinc-400 flex justify-center items-center h-full">Searching catalog...</div>;
  }

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center mb-6 text-zinc-400">
        <FiSearch className="mr-3" size={24} />
        <h1 className="text-xl md:text-2xl font-bold text-white">
          Results for "{keyword}"
        </h1>
      </div>
      
      {products.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <p className="text-zinc-500">No products matched your search criteria.</p>
          <Link to="/" className="text-white font-bold hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <div key={product._id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col hover:border-zinc-600 transition-colors group">
              
              <div className="h-40 md:h-56 bg-[#18181b] flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={`http://localhost:5000${product.images[0]}`} 
                    alt={product.name} 
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <span className="text-zinc-600 text-xs font-bold uppercase">No Image</span>
                )}
              </div>
              
              <div className="p-3 md:p-4 flex flex-col flex-grow">
                <h3 className="text-sm md:text-base font-bold text-white mb-1 truncate" title={product.name}>
                  {product.name}
                </h3>
                <p className="text-[10px] md:text-xs text-zinc-500 mb-3 uppercase tracking-wider font-semibold">
                  {product.mainGroup} - {product.subGroup}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <p className="text-base md:text-lg font-bold text-white">Rs {product.price}</p>
                  <Link 
                    to={`/product/${product._id}`} 
                    className="bg-white text-black text-[10px] md:text-xs font-bold px-3 py-1.5 rounded hover:bg-zinc-200 transition-colors"
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

export default Search;