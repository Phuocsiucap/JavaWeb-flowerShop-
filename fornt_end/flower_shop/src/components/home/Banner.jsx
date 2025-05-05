import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import banner1 from '../../assets/images/banner1.png'; //   Import ảnh
import banner2 from '../../assets/images/banner2.png'; //   Import ảnh
import banner3 from '../../assets/images/banner4.png'; //   Import ảnh

function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [
    {
      id: 1,
      title: "Khuyến mãi mùa xuân",
      description: "Giảm giá 20% cho tất cả hoa tươi",
      imageUrl: banner1,
      bgColor: "bg-pink-100"
    },
    {
      id: 2,
      title: "Bộ sưu tập mới",
      description: "Hoa tươi cho ngày cưới",
      imageUrl: banner2,
      bgColor: "bg-blue-100"
    },
    {
      id: 3,
      title: "Ưu đãi đặc biệt",
      description: "Miễn phí giao hàng cho đơn từ 500.000đ",
      imageUrl: banner3,
      bgColor: "bg-green-100"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden">
      {banners.map((banner, index) => (
        <div 
          key={banner.id} 
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className={`w-full h-full flex items-center ${banner.bgColor}`}>
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 text-center md:text-left mb-4 md:mb-0">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{banner.title}</h2>
                <p className="text-lg text-gray-600 mb-4">{banner.description}</p>
                <button className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors">
                  Mua ngay
                </button>
              </div>
              <div className="md:w-1/2">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-[400px] md:h-[500px] object-cover rounded-lg shadow-md" />
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <button 
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
        onClick={prevSlide}
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
        onClick={nextSlide}
      >
        <ChevronRight size={24} />
      </button>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button 
            key={index} 
            className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-pink-600' : 'bg-white bg-opacity-50'}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default Banner;