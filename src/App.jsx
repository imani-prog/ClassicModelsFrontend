import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import OrderCard from './components/OrderCard'
import ProductCard from './components/ProductCard'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'
import AdminProfile from './pages/AdminProfile'
import CustomerDetail from './pages/CustomerDetail'
import CustomerOrders from './pages/CustomerOrders'
import CustomerPayments from './pages/CustomerPayments'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Offices from './pages/Offices'
import OrderDetail from './pages/OrderDetail'
import Orders from './pages/Orders'
import Payments from './pages/Payments'
import Products from './pages/Products'
import SignUp from './pages/SignUp'

const RootRedirect = () => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Routes>
      {/* Root path - redirect based on authentication */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Authentication routes (no layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* Admin Profile - Separate protected route with layout */}
      <Route path="/admin-profile" element={
        <ProtectedRoute>
          <Layout>
            {console.log('🔍 App.jsx - AdminProfile route matched!')}
            <AdminProfile />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Protected routes with layout */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:customerId" element={<CustomerDetail />} />
        <Route path="/customers/:customerId/orders" element={<CustomerOrders />} />
        <Route path="/customers/:customerId/payments" element={<CustomerPayments />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/offices" element={<Offices />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product" element={<ProductCard />} />
        <Route path="/order" element={<OrderCard />} />
      </Route>
      
      {/* Catch all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
