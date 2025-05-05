import React from 'react';
import { ShoppingCart, Truck, Gift, Heart } from 'lucide-react';

const Features = () => {
  const features_data = [
    {
      id: 1,
      title: 'Giao hàng nhanh chóng',
      description: 'Chúng tôi cam kết giao hoa nhanh chóng và đúng hẹn, mang đến sự hài lòng cho khách hàng.',
      icon: <Truck size={48} className="text-blue-500" />
    },
    {
      id: 2,
      title: 'Đa dạng sản phẩm',
      description: 'Với hàng ngàn loài hoa khác nhau, bạn có thể dễ dàng tìm thấy sản phẩm phù hợp cho mọi dịp.',
      icon: <ShoppingCart size={48} className="text-green-500" />
    },
    {
      id: 3,
      title: 'Gói quà sang trọng',
      description: 'Chúng tôi cung cấp dịch vụ gói quà đẹp mắt, phù hợp cho các dịp lễ tết, sinh nhật, và kỷ niệm.',
      icon: <Gift size={48} className="text-red-500" />
    },
    {
      id: 4,
      title: 'Chăm sóc khách hàng tận tình',
      description: 'Đội ngũ nhân viên của chúng tôi luôn sẵn sàng hỗ trợ bạn mọi lúc, mang đến trải nghiệm mua sắm tuyệt vời.',
      icon: <Heart size={48} className="text-pink-500" />
    }
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8">Tính năng nổi bật</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features_data.map((feature) => (
            <div key={feature.id} className="bg-gray-100 p-6 rounded-lg shadow-lg">
              <div className="flex justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
