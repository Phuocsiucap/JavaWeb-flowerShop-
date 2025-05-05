// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/ProfilePage';
// import ProductDetail from './pages/ProductDetail';
import { AuthProvider } from './contexts/AuthContext'; 


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} /> {/* Đã sửa */}
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Profile />} />
          {/* <Route path="/product/:id" element={<ProductDetail />} /> Đã sửa */}
          {/* Thêm các route khác nếu cần */}


         
        </Routes>

      </AuthProvider>
    </Router>
  );
}

export default App;
