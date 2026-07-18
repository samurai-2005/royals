import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home'; 
import Category from './pages/Category';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Cart from './pages/Cart'; // We will create this next
import AdminRoute from './components/common/AdminRoute';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';

// Temporary placeholder components
const BulkOrder = () => <div className="p-6 text-zinc-400">B2B Bulk Order / Uniform Enquiry Form (Coming Soon)</div>;
const UserProfile = () => <div className="p-8"><h1 className="text-2xl font-bold mb-6">My Profile</h1></div>;
const Deals = () => <div className="p-8"><h1 className="text-2xl font-bold mb-6">Offers & Deals</h1></div>;
const Catalog = () => <div className="p-8"><h1 className="text-2xl font-bold mb-6">Full Catalog</h1></div>;

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="search/:keyword" element={<Search />} />
            <Route path="category/:type" element={<Category />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="bulk-order" element={<BulkOrder />} />
            <Route path="user-profile" element={<UserProfile />} />
            
            {/* New App Navigation Routes */}
            <Route path="cart" element={<Cart />} />
            <Route path="deals" element={<Deals />} />
            <Route path="catalog" element={<Catalog />} />
            
            {/* Protected Admin Route */}
            <Route element={<AdminRoute />}>
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
          
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;