import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home'; // We are now importing the real Home component
import Category from './pages/Category';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AdminRoute from './components/common/AdminRoute';

// Temporary placeholder components for the routes we haven't built yet
const ProductDetail = () => (
  <div className="p-6 text-zinc-400">
    Product Details & Measurement Input (Coming Next)
  </div>
);

const BulkOrder = () => (
  <div className="p-6 text-zinc-400">
    B2B Bulk Order / Uniform Enquiry Form (Coming Soon)
  </div>
);

const UserProfile = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
    <p className="text-zinc-400">Order history, saved measurements, and account details (Coming Soon).</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* MainLayout acts as the persistent shell for the app */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="category/:type" element={<Category />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="bulk-order" element={<BulkOrder />} />
          <Route path="user-profile" element={<UserProfile />} />
          
          {/* Protected Admin Route */}
          <Route element={<AdminRoute />}>
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
        
        {/* Login route is outside MainLayout for a full-screen design */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;