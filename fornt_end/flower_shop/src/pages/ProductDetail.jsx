import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/layout/ScrollToTop';
import Header from '../components/layout/Header';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/flower_shop/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Không thể tải thông tin sản phẩm');
        }
        
        const data = await response.json();
        setProduct(data);
        setInWishlist(data.inWishlist || false);
        setLoading(false);
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải thông tin sản phẩm. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleQuantityChange = (value) => {
    if ((quantity + value) >= 1 && (quantity + value <= (product?.stock || 1))) {
      setQuantity(quantity + value);
    }
  };

  const handleAddToCart = async () => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: id, quantity }),
      });

      if (!response.ok) {
        throw new Error('Không thể thêm vào giỏ hàng');
      }

      alert('Sản phẩm đã được thêm vào giỏ hàng!');
    } catch (err) {
      alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
    }
  };

  const toggleWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: id }),
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật danh sách yêu thích');
      }

      setInWishlist(!inWishlist);
    } catch (err) {
      alert('Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-xl text-red-500 mb-4">{error || 'Không tìm thấy sản phẩm'}</div>
        <button 
          onClick={() => navigate('/products')}
          className="flex items-center text-pink-500 hover:text-pink-600"
        >
          <ArrowLeft size={16} className="mr-1" /> Quay lại trang sản phẩm
        </button>
      </div>
    );
  }

  const discountedPrice = product.price * (1 - (product.discount || 0) / 100);

  return (
    <>
    <Header />
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/products')}
        className="flex items-center text-gray-600 hover:text-pink-500 mb-6"
      >
        <ArrowLeft size={16} className="mr-1" /> Quay lại trang sản phẩm
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="md:w-1/2 p-6">
            <div className="relative">
              <img 
                src={product.imageUrl || '/placeholder.jpg'} 
                alt={product.name}
                className="w-full h-auto object-cover rounded-lg"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{product.discount}%
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 p-6">
            <div className="mb-2 text-sm text-gray-500">{product.category}</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            
            {/* Price */}
            <div className="flex items-center mb-6">
              {product.discount > 0 && (
                <span className="text-gray-400 line-through text-lg mr-3">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
              )}
              <span className="font-bold text-pink-500 text-2xl">
                {discountedPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-medium mb-2 text-gray-700">Mô tả sản phẩm:</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-medium mb-1 text-gray-700">Danh mục:</h3>
                <p className="text-gray-600">{product.category}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1 text-gray-700">Tình trạng:</h3>
                <p className={product.stock > 0 ? "text-green-500" : "text-red-500"}>
                  {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                  {product.stock > 0 && ` (${product.stock})`}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1 text-gray-700">Dịp tặng:</h3>
                <p className="text-gray-600">{product.occasion || 'Không có thông tin'}</p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="text-gray-700 font-medium">Số lượng:</div>
              <div className="flex items-center border border-gray-300 rounded">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="px-6 py-1 border-l border-r border-gray-300">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button 
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center ${
                  product.stock > 0 
                    ? 'bg-pink-500 hover:bg-pink-600' 
                    : 'bg-gray-400 cursor-not-allowed'
                } text-white py-3 px-4 rounded-lg`}
                disabled={product.stock <= 0}
              >
                <ShoppingCart size={18} className="mr-2" />
                {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
              </button>
              <button 
                onClick={toggleWishlist}
                className="flex items-center justify-center border border-gray-300 hover:border-pink-500 hover:bg-pink-50 p-3 rounded-lg"
              >
                <Heart 
                  size={20} 
                  className={inWishlist ? "text-pink-500 fill-pink-500" : "text-gray-400"} 
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    <ScrollToTop />

    </>

  );
};

export default ProductDetail;