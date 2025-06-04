import React from 'react';
import { useParams } from 'react-router-dom';
import OrderReview from '../components/ui/OrderReview';
import Applayout from '../components/layout/AppLayout'

const OrderReviewPage = () => {
  const { id } = useParams();

  return (
    <Applayout>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Đánh giá đơn hàng</h1>
      
      {/* Sử dụng component OrderReview đã hoàn thiện */}
      <OrderReview orderId={id} />
      
      {/* Thêm nút quay lại trang đơn hàng nếu cần */}
      <div className="text-center mt-8">
        <a 
          href="/" 
          className="text-pink-500 hover:text-pink-600 font-medium inline-flex items-center"
        >
          <span className="mr-1">←</span> Quay lại trang chủ
        </a>
      </div>
    </div>
    </Applayout>
  );
};

export default OrderReviewPage;