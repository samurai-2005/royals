import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/common/ProductCard';

const Category = () => {
  const { type } = useParams(); // Gets 'ncc', 'bihar-police', 'shirts', etc. from the URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // We fetch all products for now, and filter on the frontend to accommodate 
        // both mainGroup (NCC) and subGroup (Shirts) searches easily.
        // As the app scales, we will push this filtering strictly to the backend API.
        const response = await axios.get('http://localhost:5000/api/products');
        
        // Format the URL param to match database strings (e.g., 'bihar-police' -> 'bihar police')
        const searchTerm = type.replace('-', ' ').toLowerCase();
        
        const filteredProducts = response.data.filter(p => 
          p.mainGroup.toLowerCase() === searchTerm || 
          p.subGroup.toLowerCase() === searchTerm
        );
        
        setProducts(filteredProducts);
      } catch (err) {
        setError('Failed to load products. Please check your connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type]); // Re-run this effect whenever the URL changes

  // UI States
  if (loading) return <div className="text-zinc-400 flex justify-center mt-20">Loading catalog...</div>;
  if (error) return <div className="text-red-500 flex justify-center mt-20">{error}</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-white capitalize">
          {type.replace('-', ' ')}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Showing {products.length} {products.length === 1 ? 'result' : 'results'}
        </p>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-zinc-500 text-center mt-20">
          No products found for this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;