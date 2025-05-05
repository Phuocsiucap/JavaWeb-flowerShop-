import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // Here you can integrate with your backend or newsletter API for subscription
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="bg-blue-600 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-semibold mb-4">Đăng ký nhận bản tin</h2>
        <p className="text-lg mb-8">Nhận thông tin mới nhất về các sản phẩm hoa và ưu đãi đặc biệt trực tiếp qua email của bạn.</p>
        {isSubscribed ? (
          <p className="text-lg font-medium">Cảm ơn bạn đã đăng ký! Bạn sẽ nhận được bản tin sớm nhất.</p>
        ) : (
          <form onSubmit={handleSubscribe} className="flex justify-center">
            <input
              type="email"
              className="p-4 rounded-l-lg w-80 text-gray-900"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-green-500 text-white p-4 rounded-r-lg hover:bg-green-600 transition-colors"
            >
              Đăng ký
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
