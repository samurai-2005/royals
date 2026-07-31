import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home'; 
import Category from './pages/Category';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Cart from './pages/Cart'; 
import AdminRoute from './components/common/AdminRoute';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';
import UserProfile from './pages/UserProfile';
import Checkout from './pages/Checkout';
import Deals from './pages/Deals';
import BulkOrder from './pages/BulkOrder';
import Catalog from './pages/Catalog';

// Global PWA Install Banner Component
import PWAInstallPrompt from './components/common/PWAInstallPrompt';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Main Layout containing Navbar, Sidebars, and Bottom Navigation */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="search/:keyword" element={<Search />} />
            <Route path="category/:type" element={<Category />} />
            <Route path="product/:id" element={<ProductDetail />} />
            
            <Route path="bulk-order" element={<BulkOrder />} />
            
            {/* App Navigation Routes */}
            <Route path="cart" element={<Cart />} />
            <Route path="deals" element={<Deals />} />
            <Route path="catalog" element={<Catalog />} />
            
            {/* Workspace Routes */}
            <Route path="checkout" element={<Checkout />} />
            <Route path="user-profile" element={<UserProfile />} />
            
            {/* Protected Admin Route */}
            <Route element={<AdminRoute />}>
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
          
          {/* Full-screen Login */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>

      {/* Renders the "Add to Home Screen" pop-up banner */}
      <PWAInstallPrompt />
    </CartProvider>
  );
}

export default App;