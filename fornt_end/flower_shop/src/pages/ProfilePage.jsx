import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import OrderHistory from '../components/ui/OrderHistory';  // Import component OrderHistory

const ProfilePage = () => {
  const {setInfo, currentUser, updateUserProfile, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    role: '',
    name: '',
    address: '',
    phone: ''
  });
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    setInfo();
    if (currentUser) {
      setFormData({
        id: currentUser.id || '',
        email: currentUser.email || '',
        role: currentUser.role || '',
        name: currentUser.name || '',
        address: currentUser.address || '',
        phone: currentUser.phone || ''
      });

      // Fetch user orders
      fetchUserOrders();
    }
  }, [  ]);

  const fetchUserOrders = async () => {
    // This would be replaced with an actual API call
    // Simulating orders data for now
    setTimeout(() => {
      setOrders([
        { id: "ORD-123", date: "2025-04-15", total: 65.99, status: "Delivered" },
        { id: "ORD-124", date: "2025-04-10", total: 45.50, status: "Processing" },
        { id: "ORD-125", date: "2025-03-28", total: 78.25, status: "Delivered" }
      ]);
    }, 500);
  };

  const handleLogout = () => {
    logout();
    // Redirect to home page would happen in the AuthContext
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    // Call updateUserProfile to send updated data
    updateUserProfile(formData);
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Please Login</h2>
          <p className="mb-4">You need to be logged in to view your profile.</p>
          <Link to="/login" className="bg-emerald-600 text-black bg-blue-700 border py-2 px-6 rounded-lg hover:bg-emerald-700">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">My Profile</h1>
            <button 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>

          <div className="mb-6">
            <div className="flex space-x-4 border-b">
              <button 
                className={`py-2 px-4 ${activeTab === 'info' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('info')}
              >
                Personal Information
              </button>
              <button 
                className={`py-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('orders')}
              >
                Order History
              </button>
              <button 
                className={`py-2 px-4 ${activeTab === 'wishlist' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('wishlist')}
              >
                Wishlist
              </button>
            </div>
          </div>

          {activeTab === 'info' && (
            <div>
              <h2 className="text-xl font-medium mb-4">Personal Information</h2>
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700"
                >
                  Update Profile
                </button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <OrderHistory orders={orders} />  {/* Use the imported component here */}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="text-xl font-medium mb-6">My Wishlist</h2>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
                <Link to="/products" className="text-emerald-600 hover:text-emerald-800">
                  Browse our products
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
