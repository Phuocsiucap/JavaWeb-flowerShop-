import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get('/api/ordersreveiw/all');
        if (response.data.success) {
          const reviews = response.data.data.reviews;

          // Convert to structure matching frontend display
          const formatted = reviews.map((r) => ({
            id: r.id,
            name: r.userFullName || 'Người dùng ẩn danh',
            role: 'Khách hàng',
            content: r.content,
            avatar: r.userAvatar || '/images/default-avatar.jpg'
          }));
          setTestimonials(formatted);
        }
      } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
      }
    };

    fetchTestimonials();
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  if (testimonials.length === 0) {
    return <div className="text-center py-10 text-gray-500">Chưa có đánh giá nào.</div>;
  }

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8">Khách hàng nói gì về chúng tôi</h2>
        <div className="relative">
          <div className="flex justify-center">
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg mx-auto">
              <div className="flex justify-center mb-6">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
              <p className="text-gray-600 mb-4">{testimonials[currentTestimonial].content}</p>
              <h4 className="text-xl font-semibold text-gray-800">{testimonials[currentTestimonial].name}</h4>
              <p className="text-gray-500">{testimonials[currentTestimonial].role}</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-200"
            onClick={prevTestimonial}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-200"
            onClick={nextTestimonial}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
