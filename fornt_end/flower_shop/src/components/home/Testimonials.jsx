import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Nguyễn Thị Mai",
      role: "Khách hàng",
      content: "Dịch vụ hoa của FlowerShop rất tuyệt vời! Hoa luôn tươi đẹp và giao nhanh chóng.",
      avatar: "/images/testimonial1.jpg"
    },
    {
      id: 2,
      name: "Trần Minh Tú",
      role: "Khách hàng",
      content: "Hoa tươi lâu và chất lượng tuyệt vời. Tôi sẽ tiếp tục mua ở đây.",
      avatar: "/images/testimonial2.jpg"
    },
    {
      id: 3,
      name: "Lê Quang Huy",
      role: "Khách hàng",
      content: "Rất ấn tượng với dịch vụ giao hàng nhanh và hoa đẹp. Cảm ơn FlowerShop!",
      avatar: "/images/testimonial3.jpg"
    },
    // Add more testimonials as needed
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

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
