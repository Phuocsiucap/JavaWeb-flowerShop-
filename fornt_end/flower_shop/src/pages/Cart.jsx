import React, { useState } from 'react';
import { BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/layout/ScrollToTop';


const Cart = () => {
  const { cartItems, totalItems, totalPrice, removeFromCart, updateItemQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);

  // Hàm xử lý chọn/bỏ chọn item
  const handleSelectItem = (productId) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Hàm xử lý chọn/bỏ chọn tất cả item
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map(item => item.productId));
    } else {
      setSelectedItems([]);
    }
  };

  // Hàm kiểm tra đã chọn hết chưa
  const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

  // Hàm tính tổng tiền các item được chọn
  const calculateSelectedTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.productId))
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Hàm xử lý chuyển hướng đến trang thanh toán với các item đã chọn
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    const checkoutItems = cartItems.filter(item => selectedItems.includes(item.productId));
    navigate('/checkout', { state: { items: checkoutItems } });
  };

  // Hàm xử lý xóa toàn bộ giỏ hàng hoặc chỉ các sản phẩm đã chọn
  const handleClearCart = () => {
    if (selectedItems.length === 0) {
      // Hiển thị thông báo nếu không tick chọn sản phẩm nào
      alert('Vui lòng chọn ít nhất một sản phẩm để xóa hoặc tick chọn để xóa toàn bộ.');
      return;
    } else {
      selectedItems.forEach(id => removeFromCart(id));
      setSelectedItems([]);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-4 text-green-700">Giỏ hàng của bạn</h2>
          <p className="text-gray-600 mb-6">Giỏ hàng của bạn đang trống.</p>
          <a
            href="/"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Trở về trang chủ
          </a>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4 text-green-700 text-center">Giỏ hàng của bạn</h2>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flow-root">
            <ul className="-my-6 divide-y divide-gray-200">
              <li className="py-2 flex items-center">
                <div className="flex items-center h-6 mr-4">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Chọn tất cả</span>
                </div>
              </li>
              {cartItems.map((item) => (
                <li key={item.productId} className="py-6 flex items-center">
                  <div className="flex items-center h-24 mr-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.productId)}
                      onChange={() => handleSelectItem(item.productId)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                    <img                
                      src={item.imageUrl || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-center object-cover"
                    />
                  </div>

                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.name}</h3>
                        <p className="ml-4">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-end justify-between text-sm">
                      <div className="flex items-center">
                        <button
                          onClick={() => updateItemQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded-l"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 bg-gray-100">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded-r"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="font-medium text-red-600 hover:text-red-500"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Đã chọn ({selectedItems.length} sản phẩm)</p>
              <p>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateSelectedTotal())}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">Chưa bao gồm phí vận chuyển.</p>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCheckout}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md focus:outline-none disabled:bg-gray-400"
                disabled={selectedItems.length === 0}
              >
                Thanh toán
              </button>
              
              <button
                onClick={handleClearCart}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                {selectedItems.length === 0 ? 'Xóa giỏ hàng' : 'Xóa sản phẩm đã chọn'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Cart;