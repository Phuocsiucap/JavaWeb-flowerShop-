import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { CartContext } from '../../contexts/CartContext'; 
import { BASE_URL } from '../../config';

function ProductCard({ product, toggleWishlist }) {
  const {addToCart} = useContext(CartContext);
  const discountedPrice = product.price * (1 - (product.discount || 0) / 100);

  const addproduct = async (productId) => {
      try {
        const response = await addToCart(productId);
        console.log(response);
  
        alert('Sản phẩm đã được thêm vào giỏ hàng!');
      } catch (err) {
        alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
      }
    };

  return (
    
    <div className="bg-white rounded border overflow-hidden hover:shadow-lg transition-shadow">
       <Link to={`/products/${product.id}`}>
      {/* Product Image */}
      <div className="relative">
        <img
          src={`${BASE_URL}${product.imageUrl}`|| '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discount}%
          </div>
        )}
        <button
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
          onClick={() => toggleWishlist(product.id)}
        >
          <Heart
            size={18}
            className={product.inWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400'}
          />
        </button>
      </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
         <Link to={`/products/${product.id}`}>
        <div className="text-sm text-gray-500 mb-1">{product.category}</div>
        
          <h3 className="font-medium text-lg mb-2 hover:text-pink-500 cursor-pointer">
            {product.name}
          </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mb-2">
          <div>
            {product.discount > 0 && (
              <span className="text-gray-400 line-through text-sm mr-2">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
            )}
            <span className="font-bold text-pink-500">
              {discountedPrice.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <span className={`text-sm ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
          </span>
        </div>
        </Link>
        <button
          className={`w-full p-2 rounded-lg text-white flex items-center justify-center ${
            product.stock > 0 ? 'bg-pink-500 hover:bg-pink-600' : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={() => product.stock > 0 && addproduct(product.id)}
          disabled={product.stock <= 0}
        >
          <ShoppingCart size={18} className="mr-2" />
          {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
        </button>
      </div>
    </div>
     
  );
}

export default ProductCard;