import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-4xl font-extrabold text-pink-600">Flower<span className="text-green-600">Shop</span></h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <Link to="/" className="text-gray-700 hover:text-pink-600 font-semibold text-xl">Trang chủ</Link>
            <Link to="/products" className="text-gray-700 hover:text-pink-600 font-semibold text-xl">Sản phẩm</Link>
            <Link to="/occasions" className="text-gray-700 hover:text-pink-600 font-semibold text-xl">Dịp tặng</Link>
            <Link to="/promotions" className="text-gray-700 hover:text-pink-600 font-semibold text-xl">Khuyến mãi</Link>
            <Link to="/contact" className="text-gray-700 hover:text-pink-600 font-semibold text-xl">Liên hệ</Link>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-6">
            <button className="text-gray-700 hover:text-pink-600">
              <Search size={28} />
            </button>
            <Link to="/wishlist" className="text-gray-700 hover:text-pink-600">
              <Heart size={28} />
            </Link>
            <Link to="/cart" className="text-gray-700 hover:text-pink-600 relative">
              <ShoppingCart size={28} />
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-base font-semibold">3</span>
            </Link>
            <Link to="/account" className="text-gray-700 hover:text-pink-600">
              <User size={28} />
            </Link>
            <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-6 md:hidden">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-pink-600 font-semibold py-2 text-xl">Trang chủ</Link>
              <Link to="/products" className="text-gray-700 hover:text-pink-600 font-semibold py-2 text-xl">Sản phẩm</Link>
              <Link to="/occasions" className="text-gray-700 hover:text-pink-600 font-semibold py-2 text-xl">Dịp tặng</Link>
              <Link to="/promotions" className="text-gray-700 hover:text-pink-600 font-semibold py-2 text-xl">Khuyến mãi</Link>
              <Link to="/contact" className="text-gray-700 hover:text-pink-600 font-semibold py-2 text-xl">Liên hệ</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;