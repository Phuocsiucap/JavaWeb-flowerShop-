import React, { useState, useEffect } from 'react';
import { Star, Send, ShoppingBag, Clock, Package, ThumbsUp } from 'lucide-react';

const OrderReview = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderReviews, setOrderReviews] = useState([]);
  
  // Review form state
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
        // In a real application, you would fetch the order details from your API
        // const response = await fetch(`http://localhost:8080/flower_shop/orders/${orderId}`);
        // if (!response.ok) throw new Error('Không thể tải thông tin đơn hàng');
        // const data = await response.json();
        
        // For demo purposes:
        const demoOrder = {
          id: orderId,
          orderNumber: `FS-${Math.floor(100000 + Math.random() * 900000)}`,
          orderDate: "2025-05-10",
          status: "Đã giao hàng",
          totalAmount: 1250000,
          items: [
            {
              id: 1,
              name: "Bó hoa hồng Valentine",
              price: 450000,
              quantity: 1,
              imageUrl: "/images/products/rose-bouquet.jpg"
            },
            {
              id: 2,
              name: "Hoa lan hồ điệp trắng",
              price: 800000,
              quantity: 1,
              imageUrl: "/images/products/white-orchid.jpg"
            }
          ],
          shippingAddress: {
            name: "Nguyễn Văn A",
            phone: "0901234567",
            address: "123 Đường Lê Lợi, Quận 1, TP.HCM"
          },
          paymentMethod: "COD - Thanh toán khi nhận hàng"
        };
        
        setOrder(demoOrder);
        
        // Demo reviews for the order
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
    setReviewForm({
      ...reviewForm,
      [name]: value
    });
  };

  const handleRatingChange = (field, rating) => {
    setReviewForm({
      ...reviewForm,
      [field]: rating
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewForm.name || !reviewForm.comment) {
      alert('Vui lòng điền đầy đủ tên và nội dung đánh giá');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // In a real application, you would post to your API
      // const response = await fetch(`http://localhost:8080/flower_shop/orders/${orderId}/reviews`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(reviewForm)
      // });
      
      // if (!response.ok) throw new Error('Không thể gửi đánh giá');
      
      // For demo, simulate successful submission
      const newReview = {
        id: orderReviews.length + 1,
        orderId: orderId,
        name: reviewForm.name,
        overallRating: reviewForm.overallRating,
        deliveryRating: reviewForm.deliveryRating,
        packagingRating: reviewForm.packagingRating,
        date: new Date().toISOString().split('T')[0],
        comment: reviewForm.comment,
        likes: 0
      };
      
      setOrderReviews([newReview, ...orderReviews]);
      setReviewForm({
        overallRating: 5,
        deliveryRating: 5,
        packagingRating: 5,
        comment: '',
        name: '',
        email: ''
      });
      setShowReviewForm(false);
      setSubmitting(false);
      
      alert('Cảm ơn bạn đã gửi đánh giá!');
    } catch (err) {
      alert('Không thể gửi đánh giá. Vui lòng thử lại sau.');
      setSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    // Update likes locally for demo
    setOrderReviews(orderReviews.map(review => 
      review.id === reviewId ? {...review, likes: review.likes + 1} : review
    ));
    
    // In a real app, you'd send a request to your API
    // try {
    //   await fetch(`http://localhost:8080/flower_shop/order-reviews/${reviewId}/like`, {
    //     method: 'POST'
    //   });
    // } catch (err) {
    //   console.error('Error liking review:', err);
    // }
  };

  // Render stars for a given rating
  const renderStars = (rating, field = null, interactive = false) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index}
        size={interactive ? 24 : 18}
        className={`${index < rating 
          ? "text-yellow-400 fill-yellow-400" 
          : "text-gray-300"} ${interactive ? "cursor-pointer" : ""}`}
        onClick={interactive && field ? () => handleRatingChange(field, index + 1) : undefined}
      />
    ));
  };

  // Calculate average rating
  const getAverageRating = (field) => {
    if (orderReviews.length === 0) return 0;
    const sum = orderReviews.reduce((acc, review) => acc + review[field], 0);
    return (sum / orderReviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="py-4 text-center">
        <div className="text-gray-600">Đang tải thông tin đơn hàng...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-4 text-center">
        <div className="text-red-500">{error || 'Không tìm thấy thông tin đơn hàng'}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <ShoppingBag size={24} className="mr-2" />
        Đánh giá đơn hàng #{order.orderNumber}
      </h2>
      
      {/* Order Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-700">Thông tin đơn hàng:</h3>
            <div className="mt-2">
              <div className="flex items-center text-sm mb-1">
                <ShoppingBag size={14} className="mr-2 text-gray-500" />
                <span className="text-gray-600">Mã đơn hàng: <span className="font-medium">{order.orderNumber}</span></span>
              </div>
              <div className="flex items-center text-sm mb-1">
                <Clock size={14} className="mr-2 text-gray-500" />
                <span className="text-gray-600">Ngày đặt: <span className="font-medium">{order.orderDate}</span></span>
              </div>
              <div className="flex items-center text-sm">
                <Package size={14} className="mr-2 text-gray-500" />
                <span className="text-gray-600">Trạng thái: <span className="font-medium text-green-600">{order.status}</span></span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700">Sản phẩm trong đơn:</h3>
            <div className="mt-2 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center text-sm">
                  <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden mr-2">
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {e.target.src = "/api/placeholder/80/80"}}
                      />
                    )}
                  </div>
                  <span className="text-gray-600">
                    {item.name} x {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Ratings Summary */}
      <div className="flex flex-col md:flex-row md:space-x-8 mb-8 pb-8 border-b border-gray-200">
        {/* Left side - Average ratings */}
        <div className="md:w-1/3 mb-6 md:mb-0">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-800 mb-2">{getAverageRating('overallRating')}</div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(getAverageRating('overallRating')))}
            </div>
            <div className="text-gray-600 mb-4">Đánh giá tổng thể</div>
            
            <div className="flex justify-between mb-2 px-4">
              <span className="text-gray-600">Giao hàng:</span>
              <div className="flex">{renderStars(Math.round(getAverageRating('deliveryRating')))}</div>
            </div>
            
            <div className="flex justify-between mb-4 px-4">
              <span className="text-gray-600">Đóng gói:</span>
              <div className="flex">{renderStars(Math.round(getAverageRating('packagingRating')))}</div>
            </div>
            
            <div className="text-gray-600 mb-4">Dựa trên {orderReviews.length} đánh giá</div>
            
            <button 
              onClick={() => setShowReviewForm(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg w-full"
            >
              Viết đánh giá
            </button>
          </div>
        </div>
        
        {/* Right side - Reviews list */}
        <div className="md:w-2/3">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Đánh giá từ khách hàng</h3>
          
          {orderReviews.length > 0 ? (
            orderReviews.map(review => (
              <div key={review.id} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold text-lg overflow-hidden">
                      {review.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-800">{review.name}</div>
                      <div className="text-sm text-gray-500">{review.date}</div>
                    </div>
                  </div>
                  <div className="flex">
                    {renderStars(review.overallRating)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600 mr-2">Giao hàng:</span>
                    <div className="flex">{renderStars(review.deliveryRating)}</div>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600 mr-2">Đóng gói:</span>
                    <div className="flex">{renderStars(review.packagingRating)}</div>
                  </div>
                </div>
                
                <div className="text-gray-700 mb-3">{review.comment}</div>
                
                <button 
                  onClick={() => handleLikeReview(review.id)}
                  className="flex items-center text-sm text-gray-500 hover:text-pink-500"
                >
                  <ThumbsUp size={14} className="mr-1" />
                  Hữu ích ({review.likes})
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              Chưa có đánh giá nào cho đơn hàng này. Hãy là người đầu tiên đánh giá!
            </div>
          )}
        </div>
      </div>
      
      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Đánh giá đơn hàng của bạn</h3>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">Đánh giá tổng thể</label>
                <div className="flex">
                  {renderStars(reviewForm.overallRating, 'overallRating', true)}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Đánh giá giao hàng</label>
                <div className="flex">
                  {renderStars(reviewForm.deliveryRating, 'deliveryRating', true)}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Đánh giá đóng gói</label>
                <div className="flex">
                  {renderStars(reviewForm.packagingRating, 'packagingRating', true)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">Tên của bạn *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={reviewForm.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">Email của bạn (không bắt buộc)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={reviewForm.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="comment" className="block text-gray-700 mb-2">Nhận xét của bạn *</label>
              <textarea
                id="comment"
                name="comment"
                rows="4"
                value={reviewForm.comment}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                placeholder="Chia sẻ trải nghiệm của bạn về đơn hàng này, bao gồm chất lượng sản phẩm, dịch vụ giao hàng và đóng gói..."
              ></textarea>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className={`bg-pink-500 hover:bg-pink-600 text-white py-2 px-6 rounded-lg flex items-center ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Send size={16} className="mr-2" />
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-6 rounded-lg"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderReview;