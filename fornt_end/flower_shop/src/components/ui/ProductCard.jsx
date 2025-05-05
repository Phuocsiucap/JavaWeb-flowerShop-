import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

function ProductCard({key, product }) {
  const { id, name, imageUrl, price, originalPrice, discount, slug } = product;
//   { 
//     id: 1, 
//     name: "Bó hoa hồng đỏ", 
//     imageUrl: "/api/placeholder/300/300", 
//     price: 450000, 
//     originalPrice: 500000, 
//     discount: 10,
//     slug: "bo-hoa-hong-do"
//   },
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <Link to={`/product/${slug}`}>
          <img src={imageUrl} alt={name} className="w-full h-48 object-cover" />
        </Link>
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
        <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-pink-100">
          <Heart size={20} className="text-pink-600" />
        </button>
      </div>
      <div className="p-4">
        <Link to={`/product/${slug}`}>
          <h3 className="font-medium text-gray-800 mb-2">{name}</h3>
        </Link>
        <div className="flex items-center">
          <span className="text-pink-600 font-bold">{formatPrice(price)}</span>
          {discount > 0 && (
            <span className="ml-2 text-gray-500 text-sm line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
        <button className="mt-4 w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition-colors flex items-center justify-center">
          <ShoppingCart size={16} className="mr-2" />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}

export default ProductCard;