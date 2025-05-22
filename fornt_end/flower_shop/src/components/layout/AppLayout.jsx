import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
const AppLayout = ({children})  => {
    return (
   <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      
      <ScrollToTop />
    </div>
  );
};

export default AppLayout;