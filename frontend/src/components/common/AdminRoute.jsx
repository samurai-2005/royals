import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return userInfo && userInfo.role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;