import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import {useCart} from '../../contexts/CartContext';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { countItem } = useCart(); // Giả sử bạn có một context hoặc state quản lý giỏ hàng
  const cartItemCount = countItem; // sau này có thể lấy từ context/cart state

  return (
    <header className="bg-orange-500 bg-opacity-100 shadow-md sticky top-0 z-50 bg-cover bg-top px-4"
      style={{ backgroundImage: 'url("bg_header.jpg")' }}>

      <div className="container  mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-pink-600">
              Flower<span className="text-green-600">Shop</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <Link to="/" className="text-gray-700 hover:text-pink-600 font-semibold text-lg">Trang chủ</Link>
            <Link to="/products" className="text-gray-700 hover:text-pink-600 font-semibold text-lg">Sản phẩm</Link>
            <Link to="/occasions" className="text-gray-700 hover:text-pink-600 font-semibold text-lg">Dịp tặng</Link>
            <Link to="/promotions" className="text-gray-700 hover:text-pink-600 font-semibold text-lg">Khuyến mãi</Link>
            <Link to="/contact" className="text-gray-700 hover:text-pink-600 font-semibold text-lg">Liên hệ</Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-5">
            <button className="text-gray-700 hover:text-pink-600">
              <Search size={26} />
            </button>
            <Link to="/cart" className="relative text-gray-700 hover:text-pink-600">
              <ShoppingCart size={26} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link to="/account" className="text-gray-700 hover:text-pink-600">
              <User size={26} />
            </Link>
            <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className={`mt-4 md:hidden transition-all duration-300 ${isMenuOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-gray-700 hover:text-pink-600 font-semibold py-2 text-lg">Trang chủ</Link>
            <Link to="/products" className="text-gray-700 hover:text-pink-600 font-semibold py-2 text-lg">Sản phẩm</Link>
            <Link to="/occasions" className="text-gray-700 hover:text-pink-600 font-semibold py-2 text-lg">Dịp tặng</Link>
            <Link to="/promotions" className="text-gray-700 hover:text-pink-600 font-semibold py-2 text-lg">Khuyến mãi</Link>
            <Link to="/contact" className="text-gray-700 hover:text-pink-600 font-semibold py-2 text-lg">Liên hệ</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
