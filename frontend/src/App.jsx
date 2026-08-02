import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as Sentry from '@sentry/react';
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

// Compliance & Customer Support Pages
import Contact from './pages/Contact';
import PolicyPage from './pages/PolicyPage';

// UX Utilities & Banners
import ScrollToTop from './components/common/ScrollToTop';
import GuestAuthModal from './components/common/GuestAuthModal';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';

// Fallback UI shown if a React component crashes unexpectedly
function ErrorFallback({ resetError }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#18181b] border border-zinc-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
          !
        </div>
        <h2 className="text-xl font-bold mb-2">Something Went Wrong</h2>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          An unexpected error occurred. Our technical team has been automatically notified and is working to resolve it.
        </p>
        <button
          onClick={() => {
            if (resetError) resetError();
            window.location.href = '/';
          }}
          className="w-full bg-white text-black font-black py-3.5 rounded-xl hover:bg-zinc-200 transition-colors text-sm shadow-lg"
        >
          Return to Home Page
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog={false}>
      <CartProvider>
        <Router>
          {/* Resets scroll position to top (0,0) on every route navigation */}
          <ScrollToTop />

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

              {/* Compliance & Contact Routes */}
              <Route path="contact" element={<Contact />} />
              <Route path="refund-policy" element={<PolicyPage />} />
              <Route path="shipping-policy" element={<PolicyPage />} />
              <Route path="privacy-policy" element={<PolicyPage />} />
              <Route path="terms-and-conditions" element={<PolicyPage />} />
              
              {/* Protected Admin Route */}
              <Route element={<AdminRoute />}>
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>
            
            {/* Full-screen Login */}
            <Route path="/login" element={<Login />} />
          </Routes>

          {/* Prompts guests navigating the site to sign in or register */}
          <GuestAuthModal />
        </Router>

        {/* Renders the "Add to Home Screen" pop-up banner */}
        <PWAInstallPrompt />
      </CartProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;