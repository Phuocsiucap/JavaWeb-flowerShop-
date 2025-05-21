import React, { useState, useEffect } from 'react';
import { Star, Send, ShoppingBag, Clock, Package, ThumbsUp } from 'lucide-react';
import axios from '../../axiosInstance';

const OrderReview = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderReviews, setOrderReviews] = useState([]);

  const [reviewForm, setReviewForm] = useState({
    overallRating: 5,
    deliveryRating: 5,
    packagingRating: 5,
    comment: '',
    name: '',
    email: ''
  });

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/orders/${orderId}`,
          {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`
           }
          }
        );
        console.log(response.data);
        setOrder(response.data.data.order);

        const demoReviews = [
          {
            id: 1,
            orderId: orderId,
            name: "Trần Thị B",
            overallRating: 5,
            deliveryRating: 4,
            packagingRating: 5,
            date: "2025-05-15",
            comment: "Đơn hàng được giao đúng hẹn, hoa rất tươi và đẹp. Đóng gói cẩn thận. Rất hài lòng với trải nghiệm mua hàng!",
            likes: 2
          }
        ];

        setOrderReviews(demoReviews);
        setLoading(false);
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải thông tin đơn hàng. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({ ...reviewForm, [name]: value });
  };

  const handleRatingChange = (field, rating) => {
    setReviewForm({ ...reviewForm, [field]: rating });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) {
      alert('Vui lòng điền đầy đủ tên và nội dung đánh giá');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(`/api/ordersreveiw/${orderId}/reviews`, reviewForm, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const newReview = {
        ...reviewForm,
        id: orderReviews.length + 1,
        orderId: orderId,
        date: new Date().toISOString().split('T')[0],
        likes: 0
      };

      setOrderReviews([newReview, ...orderReviews]);
      setReviewForm({ overallRating: 5, deliveryRating: 5, packagingRating: 5, comment: '', name: '', email: '' });
      setShowReviewForm(false);
      setSubmitting(false);

      alert('Cảm ơn bạn đã gửi đánh giá!');
    } catch (err) {
      alert('Không thể gửi đánh giá. Vui lòng thử lại sau.');
      setSubmitting(false);
    }
  };

  const handleLikeReview = (reviewId) => {
    setOrderReviews(orderReviews.map(review =>
      review.id === reviewId ? { ...review, likes: review.likes + 1 } : review
    ));
  };

  const renderStars = (rating, field = null, interactive = false) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        size={interactive ? 24 : 18}
        className={`${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} ${interactive ? "cursor-pointer" : ""}`}
        onClick={interactive && field ? () => handleRatingChange(field, index + 1) : undefined}
      />
    ));
  };

  const getAverageRating = (field) => {
    if (orderReviews.length === 0) return 0;
    const sum = orderReviews.reduce((acc, review) => acc + review[field], 0);
    return (sum / orderReviews.length).toFixed(1);
  };

  if (loading) return <div className="text-center py-4 text-gray-600">Đang tải thông tin đơn hàng...</div>;
  if (error || !order) return <div className="text-center py-4 text-red-500">{error || 'Không tìm thấy thông tin đơn hàng'}</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <ShoppingBag className="mr-2" size={24} />
        Đánh giá đơn hàng #{order.orderNumber}
      </h2>

      {/* Nội dung đánh giá, tổng quan, biểu mẫu, và danh sách đánh giá tương tự phần trước */}
      {/* Bạn có thể tiếp tục phần render dựa trên code đã viết trước đó */}
    </div>
  );
};

export default OrderReview;
