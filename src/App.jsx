import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import OrderCard from './components/OrderCard'
import ProductCard from './components/ProductCard'
import CustomerDetail from './pages/CustomerDetail'
import CustomerEdit from './pages/CustomerEdit'
import CustomerOrders from './pages/CustomerOrders'
import CustomerPayments from './pages/CustomerPayments'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import NotFound from './pages/NotFound'
import Offices from './pages/Offices'
import Orders from './pages/Orders'
import Payments from './pages/Payments'
import Products from './pages/Products'
// import Navbar from './components/Navbar'


const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:customerId" element={<CustomerDetail />} />
        <Route path="/customers/:customerId/edit" element={<CustomerEdit />} />
        <Route path="/customers/:customerId/orders" element={<CustomerOrders />} />
        <Route path="/customers/:customerId/payments" element={<CustomerPayments />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/offices" element={<Offices />} />
        <Route path="/orders" element={<Orders />} />
        {/* <Route path="/Navbar" element={<Navbar />} /> */}
        <Route path="/payments" element={<Payments />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product" element={<ProductCard />} />
        <Route path="/order" element={<OrderCard />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
