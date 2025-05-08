import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/layout/ScrollToTop';

const Cart = () => {
  const { cartItems, totalItems, totalPrice, removeFromCart, updateItemQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  // Hàm xử lý chuyển hướng đến trang thanh toán
  const handleCheckout = () => {
    navigate('/checkout');
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
              {cartItems.map((item) => (
                <li key={item.id} className="py-6 flex">
                  <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                    <img
                      src={item.image}
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
                          onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded-l"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 bg-gray-100">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded-r"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
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
              <p>Tổng cộng ({totalItems} sản phẩm)</p>
              <p>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">Chưa bao gồm phí vận chuyển.</p>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCheckout}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md focus:outline-none"
              >
                Thanh toán
              </button>
              
              <button
                onClick={clearCart}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                Xóa giỏ hàng
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