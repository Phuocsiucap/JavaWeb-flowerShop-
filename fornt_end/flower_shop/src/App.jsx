import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import Cart from './pages/Cart'; 

import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';

import ProductPage from './pages/ProductPage';
import ProductDetail from './pages/ProductDetail';

import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import HomeAdmin from './pages/admin/HomeAdmin';
import UsersManagement from './pages/admin/UsersManagementPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminOrderListPage from './pages/admin/AdminOrderListPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AdminProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              
              <Route path="/products" element={<ProductPage />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              
              
            </Routes>
          </AdminProvider>
        </CartProvider>
        <AdminProvider>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedAdminRoute>
                  <Routes>
                    <Route path="/home" element={<HomeAdmin />} />
                    <Route path="/" element={<HomeAdmin />} />
                    {/* <Route path="/products" element={<ProductsPage />} /> */}
                    {/* <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/customers" element={<CustomersPage />} /> */}
                    <Route path="/customers" element={<UsersManagement />} />
                  </Routes>
                </ProtectedAdminRoute>
              } 
            />
          </Routes>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;