// src/components/admin/Layout.jsx
import React from 'react';
import Header from './Header';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
