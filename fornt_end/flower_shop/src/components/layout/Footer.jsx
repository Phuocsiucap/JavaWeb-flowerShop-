import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-200 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Flower<span className="text-pink-400">Shop</span></h3>
            <p className="mb-4">Chuyên cung cấp các loại hoa tươi, hoa chậu, hoa sự kiện với chất lượng tốt nhất.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-pink-400">FB</a>
              <a href="#" className="hover:text-pink-400">IG</a>
              <a href="#" className="hover:text-pink-400">YT</a>
              <a href="#" className="hover:text-pink-400">TW</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Thông tin</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-pink-400">Về chúng tôi</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-pink-400">Chính sách vận chuyển</Link></li>
              <li><Link to="/return-policy" className="hover:text-pink-400">Chính sách đổi trả</Link></li>
              <li><Link to="/terms" className="hover:text-pink-400">Điều khoản dịch vụ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Tài khoản</h4>
            <ul className="space-y-2">
              <li><Link to="/account" className="hover:text-pink-400">Tài khoản của tôi</Link></li>
              <li><Link to="/orders" className="hover:text-pink-400">Lịch sử đơn hàng</Link></li>
              <li><Link to="/wishlist" className="hover:text-pink-400">Sản phẩm yêu thích</Link></li>
              <li><Link to="/cart" className="hover:text-pink-400">Giỏ hàng</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Liên hệ</h4>
            <ul className="space-y-2">
              <li>123 Đường Hoa, Quận 1, TP.HCM</li>
              <li>Phone: 0123 456 789</li>
              <li>Email: info@flowershop.com</li>
              <li>Giờ làm việc: 8:00 - 22:00</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} FlowerShop. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;