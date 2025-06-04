import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, Send } from 'lucide-react';
import axios from '../../axiosInstance'

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userReview, setUserReview] = useState({
    rating: 5,
    comment: '',
    name: '',
    email: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {      try {
        setLoading(true);
        // Sử dụng API để lấy đánh giá theo productId
        const response = await axios.get(`/api/ordersreview/product/${productId}`);
        
        if (response.data.success && response.data.data.reviews) {
          // Convert the reviews object to an array and format the data
          const reviewsData = Object.values(response.data.data.reviews).map(review => ({
            id: review.id,
            name: review.name,
            avatar: null,
            rating: review.overallRating,
            date: review.date,
            comment: review.comment,
            likes: review.likes || 0,
            email: review.email,
            orderId: review.orderId,
            deliveryRating: review.deliveryRating,
            packagingRating: review.packagingRating
          }));
          
          setReviews(reviewsData);
        } else {
          // Fallback khi API không trả về dữ liệu đúng định dạng
          setReviews([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError('Đã xảy ra lỗi khi tải đánh giá. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserReview({
      ...userReview,
      [name]: value
    });
  };

  const handleRatingChange = (newRating) => {
    setUserReview({
      ...userReview,
      rating: newRating
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!userReview.name || !userReview.comment) {
      alert('Vui lòng điền đầy đủ tên và nội dung đánh giá');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Để submit review, cần orderId
      // Trong thực tế, cần có thông tin về order của người dùng với sản phẩm này
      // Tạm thời, sử dụng phương thức mẫu
      const mockOrderId = "mock-order-id"; // Trong thực tế, cần lấy orderId thực từ hệ thống
        const response = await axios.post(`/api/ordersreview/${mockOrderId}/reviews`, {
        name: userReview.name,
        email: userReview.email,
        overallRating: userReview.rating,
        deliveryRating: userReview.rating,
        packagingRating: userReview.rating,
        comment: userReview.comment,
        date: new Date().toISOString().split('T')[0],
        likes: 0
      });
      
      if (!response.ok) throw new Error('Không thể gửi đánh giá');
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.review) {
        // Thêm review mới vào danh sách
        const newReview = {
          id: result.data.review.id,
          name: userReview.name,
          avatar: null,
          rating: userReview.rating,
          date: new Date().toISOString().split('T')[0],
          comment: userReview.comment,
          likes: 0
        };
        
        setReviews([newReview, ...reviews]);
        setUserReview({
          rating: 5,
          comment: '',
          name: '',
          email: ''
        });
        setShowReviewForm(false);
        alert('Cảm ơn bạn đã gửi đánh giá!');
      } else {
        alert('Không thể gửi đánh giá. Vui lòng thử lại sau.');
      }
      
      setSubmitting(false);
    } catch (err) {
      console.error("Error submitting review:", err);
      alert('Không thể gửi đánh giá. Vui lòng thử lại sau.');
      setSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    try {
      // Sử dụng API để like review
      // Để like review, cần orderId
      // Trong thực tế, cần có thông tin về order
      const mockOrderId = "mock-order-id"; // Trong thực tế, cần lấy orderId thực từ hệ thống
        const response = await axios.post(`/api/ordersreview/${mockOrderId}/reviews/${reviewId}/like`);
      
      if (!response.ok) {
        throw new Error('Không thể thích đánh giá');
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.review) {
        // Cập nhật số lượng like trong UI
        setReviews(reviews.map(review => 
          review.id === reviewId ? {...review, likes: result.data.review.likes} : review
        ));
      } else {
        // Tạm thời cập nhật UI ngay cả khi không có kết quả từ API
        setReviews(reviews.map(review => 
          review.id === reviewId ? {...review, likes: review.likes + 1} : review
        ));
      }
    } catch (err) {
      console.error("Error liking review:", err);
      // Tạm thời cập nhật UI ngay cả khi có lỗi
      setReviews(reviews.map(review => 
        review.id === reviewId ? {...review, likes: review.likes + 1} : review
      ));
    }
  };
  
  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  
  const getRatingPercentage = (stars) => {
    if (reviews.length === 0) return 0;
    const count = reviews.filter(review => review.rating === stars).length;
    return Math.round((count / reviews.length) * 100);
  };

  // Render stars for a given rating
  const renderStars = (rating, interactive = false) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index}
        size={interactive ? 24 : 18}
        className={`${index < rating 
          ? "text-yellow-400 fill-yellow-400" 
          : "text-gray-300"} ${interactive ? "cursor-pointer" : ""}`}
        onClick={interactive ? () => handleRatingChange(index + 1) : undefined}
      />
    ));
  };

  // Render additional ratings if available
  const renderAdditionalRatings = (review) => {
    if (!review.deliveryRating && !review.packagingRating) return null;
    
    return (
      <div className="mt-2 text-sm text-gray-500">
        {review.deliveryRating && (
          <div className="flex items-center">
            <span className="mr-2">Giao hàng:</span>
            <div className="flex">
              {renderStars(review.deliveryRating)}
            </div>
          </div>
        )}
        {review.packagingRating && (
          <div className="flex items-center mt-1">
            <span className="mr-2">Đóng gói:</span>
            <div className="flex">
              {renderStars(review.packagingRating)}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-4 text-center">
        <div className="text-gray-600">Đang tải đánh giá...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Đánh giá sản phẩm</h2>
      
      {/* Reviews Summary */}
      <div className="flex flex-col md:flex-row md:space-x-8 mb-8 pb-8 border-b border-gray-200">
        {/* Left side - Average rating */}
        <div className="md:w-1/3 mb-6 md:mb-0">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-800 mb-2">{getAverageRating()}</div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(getAverageRating()))}
            </div>
            <div className="text-gray-600">Dựa trên {reviews.length} đánh giá</div>
            
            <button 
              onClick={() => setShowReviewForm(true)}
              className="mt-4 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg w-full"
            >
              Viết đánh giá
            </button>
          </div>
        </div>
        
        {/* Right side - Rating breakdown */}
        <div className="md:w-2/3">
          {[5, 4, 3, 2, 1].map(stars => (
            <div key={stars} className="flex items-center mb-2">
              <div className="flex items-center w-28">
                {renderStars(stars)}
              </div>
              <div className="w-full mx-4">
                <div className="h-3 bg-gray-200 rounded-full">
                  <div 
                    className="h-3 bg-yellow-400 rounded-full" 
                    style={{width: `${getRatingPercentage(stars)}%`}}
                  ></div>
                </div>
              </div>
              <div className="w-12 text-gray-600 text-sm">{getRatingPercentage(stars)}%</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Viết đánh giá của bạn</h3>
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Đánh giá của bạn</label>
              <div className="flex">
                {renderStars(userReview.rating, true)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">Tên của bạn *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userReview.name}
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
                  value={userReview.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="comment" className="block text-gray-700 mb-2">Đánh giá của bạn *</label>
              <textarea
                id="comment"
                name="comment"
                rows="4"
                value={userReview.comment}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này..."
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
      
      {/* Review List */}
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        <MessageCircle size={20} className="inline mr-2" />
        {reviews.length} đánh giá
      </h3>
      
      <div>
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
              <div className="flex justify-between mb-2">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold text-lg overflow-hidden">
                    {review.avatar ? (
                      <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                    ) : (
                      review.name.charAt(0)
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-800">{review.name}</div>
                    <div className="text-sm text-gray-500">{review.date}</div>
                  </div>
                </div>
                <div className="flex">
                  {renderStars(review.rating)}
                </div>
              </div>
              
              {/* Render additional ratings for delivery and packaging */}
              {renderAdditionalRatings(review)}
              
              <div className="text-gray-700 mb-3 mt-2">{review.comment}</div>
              
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
            Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;