
import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/layout/ScrollToTop';

import Cookies from 'js-cookie';
import { CreditCard, Calendar, Lock, Truck, CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import axios from '../axiosInstance';
import { useLocation, useNavigate } from 'react-router-dom';


export default function CheckoutPage() {
  const { cartItems, totalPrice, removeFromCart } = useCart();
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'Credit Card',
  });
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
  });
  const [step, setStep] = useState(1);
  const [orderStatus, setOrderStatus] = useState('pending');
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();

  // const location = useLocation();
  // const selectedItems = location.state?.items || cartItems; // Ưu tiên items từ location nếu có
  const selectedItems = localStorage.getItem('checkoutItems');

  const totalAmount = selectedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    
  );

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep1 = () => {
    return shippingInfo.fullName && shippingInfo.phone;
  };

  const validateStep2 = () => {
    return shippingInfo.address && shippingInfo.city && shippingInfo.district && shippingInfo.ward;
  };

  const validateStep3 = () => {
    if (paymentInfo.paymentMethod === 'Credit Card') {
      return paymentInfo.cardNumber && paymentInfo.cardHolder && paymentInfo.expiryDate && paymentInfo.cvv;
    }
    return true;
  };

  const handleNextStep = () => {
    if ((step === 1 && !validateStep1()) ||
        (step === 2 && !validateStep2())) return;
    setStep((prevStep) => prevStep + 1);
  };

  const handlePrevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmitOrder = async (e) => {
    if (!validateStep3()) return;
    e.preventDefault();
    setOrderStatus('processing');

    const orderData = {
      shippingAddress: `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}`,
      phoneNumber: shippingInfo.phone,
      paymentMethod: paymentInfo.paymentMethod,
      items: selectedItems.map(item => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const response = await axios.post("/api/checkout", orderData, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });

      console.log('Order response:', response);
      if (response.data?.orderId) {
         for (const item of selectedItems) {
            await removeFromCart(item.productId);
          }
          localStorage.removeItem('checkoutItems');
        setOrderId(response.data.orderId);
        setStep(4);
      } else {
        console.error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setOrderStatus('done');
    }
  };


  if (selectedItems.length === 0) {
    return <p>Không có sản phẩm nào được chọn để thanh toán.</p>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    })
      .format(amount)
      .replace('₫', 'VNĐ');
  };

  if (selectedItems.length === 0) {
   

    return (
      <div className="max-w-6xl mx-auto p-4 text-center">
        <Header />
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Giỏ hàng trống</h1>
        <p className="text-gray-600 mb-4">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
        <a
          href="/"
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Quay về trang chủ
        </a>
        <Footer />
        <ScrollToTop />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="flex flex-col lg:flex-row justify-between gap-8 max-w-6xl mx-auto p-4">
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Thanh toán</h1>
            <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
          </div>

          <div className="flex justify-between mb-8">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-100 border-green-600' : 'bg-gray-100 border-gray-300'} border-2`}>
                <span className="text-sm font-medium">1</span>
              </div>
              <span className="text-xs mt-1">Thông tin</span>
            </div>
            <div className="w-1/4 h-0.5 mt-4 bg-gray-200 relative">
              <div className={`absolute left-0 top-0 h-full bg-green-500 transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-100 border-green-600' : 'bg-gray-100 border-gray-300'} border-2`}>
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="text-xs mt-1">Giao hàng</span>
            </div>
            <div className="w-1/4 h-0.5 mt-4 bg-gray-200 relative">
              <div className={`absolute left-0 top-0 h-full bg-green-500 transition-all duration-300 ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-100 border-green-600' : 'bg-gray-100 border-gray-300'} border-2`}>
                <span className="text-sm font-medium">3</span>
              </div>
              <span className="text-xs mt-1">Thanh toán</span>
            </div>
            <div className="w-1/4 h-0.5 mt-4 bg-gray-200 relative">
              <div className={`absolute left-0 top-0 h-full bg-green-600 transition-all duration-300 ${step >= 4 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className={`flex flex-col items-center ${step >= 4 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-green-100 border-green-600' : 'bg-gray-100 border-gray-300'} border-2`}>
                <span className="text-sm font-medium">4</span>
              </div>
              <span className="text-xs mt-1">Xác nhận</span>
            </div>
          </div>

          {step === 1 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Thông tin liên hệ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Truck size={20} />
                <span>Thông tin giao hàng</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      id="city"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Chọn Tỉnh/TP</option>
                      <option value="hanoi">Hà Nội</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="danang">Đà Nẵng</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                      Quận/Huyện
                    </label>
                    <select
                      id="district"
                      name="district"
                      value={shippingInfo.district}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      <option value="district1">Quận 1</option>
                      <option value="district2">Quận 2</option>
                      <option value="district3">Quận 3</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
                      Phường/Xã
                    </label>
                    <select
                      id="ward"
                      name="ward"
                      value={shippingInfo.ward}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Chọn Phường/Xã</option>
                      <option value="ward1">Phường 1</option>
                      <option value="ward2">Phường 2</option>
                      <option value="ward3">Phường 3</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={handlePrevStep}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                <span>Phương thức thanh toán</span>
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <label
                    className={`flex items-center justify-center p-4 border rounded-md cursor-pointer ${
                      paymentInfo.paymentMethod === 'Cash' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash"
                      checked={paymentInfo.paymentMethod === 'Cash'}
                      onChange={handlePaymentChange}
                      className="hidden"
                    />
                    <span className="text-sm font-medium">Tiền mặt</span>
                  </label>
                  <label
                    className={`flex items-center justify-center p-4 border rounded-md cursor-pointer ${
                      paymentInfo.paymentMethod === 'Credit Card' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Credit Card"
                      checked={paymentInfo.paymentMethod === 'Credit Card'}
                      onChange={handlePaymentChange}
                      className="hidden"
                    />
                    <span className="text-sm font-medium">Thẻ tín dụng</span>
                  </label>
                  <label
                    className={`flex items-center justify-center p-4 border rounded-md cursor-pointer ${
                      paymentInfo.paymentMethod === 'Banking' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Banking"
                      checked={paymentInfo.paymentMethod === 'Banking'}
                      onChange={handlePaymentChange}
                      className="hidden"
                    />
                    <span className="text-sm font-medium">Chuyển khoản</span>
                  </label>
                </div>

                {paymentInfo.paymentMethod === 'Credit Card' && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Số thẻ
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={paymentInfo.cardNumber}
                          onChange={handlePaymentChange}
                          placeholder="1234 5678 9012 3456"
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                        <CreditCard className="absolute right-3 top-2.5 text-gray-400" size={16} />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                        Tên chủ thẻ
                      </label>
                      <input
                        type="text"
                        id="cardHolder"
                        name="cardHolder"
                        value={paymentInfo.cardHolder}
                        onChange={handlePaymentChange}
                        placeholder="NGUYEN VAN A"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày hết hạn
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={paymentInfo.expiryDate}
                            onChange={handlePaymentChange}
                            placeholder="MM/YY"
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                          <Calendar className="absolute right-3 top-2.5 text-gray-400" size={16} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={paymentInfo.cvv}
                            onChange={handlePaymentChange}
                            placeholder="123"
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                          <Lock className="absolute right-3 top-2.5 text-gray-400" size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={handlePrevStep}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleSubmitOrder}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  disabled={orderStatus === 'processing'}
                >
                  {orderStatus === 'processing' ? 'Đang xử lý...' : 'Hoàn tất thanh toán'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle size={64} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">Đặt hàng thành công!</h2>
              <p className="text-gray-600 mb-4">
                Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-medium">
                  Mã đơn hàng: <span className="text-green-600">#{orderId}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Bạn sẽ nhận được email xác nhận trong ít phút.
                </p>
              </div>
              <a
                href="/"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Quay về trang chủ
              </a>
            </div>
          )}
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
              Tóm tắt đơn hàng
            </h2>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">SL: {item.quantity}</p>
                  </div>
                  <div className="font-medium">{formatCurrency(item.price)}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>{formatCurrency(30000)}</span>
              </div>
              <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-green-700">{formatCurrency(totalPrice + 30000)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}