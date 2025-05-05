import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarRef = useRef(null); // Tham chiếu đến Sidebar

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false); // Ẩn sidebar nếu màn hình nhỏ hơn 768px
      } else {
        setSidebarOpen(true); // Hiển thị sidebar nếu màn hình lớn hơn 768px
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Đóng Sidebar khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false); // Đóng sidebar khi click ngoài
      }
    };

    if (window.innerWidth < 768) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen); // Toggle mở/đóng Sidebar
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        {/* Gửi ref cho Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} ref={sidebarRef} />

        <main className="flex-1 p-6 ml-0 md:ml-64 transition-all duration-300 overflow-y-auto">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AppLayout;
