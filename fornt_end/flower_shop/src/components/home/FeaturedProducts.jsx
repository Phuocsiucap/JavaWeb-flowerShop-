import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ui/ProductCard';
export const products = [
  { 
    id: 1, 
    name: "Bó hoa hồng đỏ", 
    imageUrl: "/api/placeholder/300/300", 
    price: 450000, 
    originalPrice: 500000, 
    discount: 10,
    slug: "bo-hoa-hong-do"
  },
  { 
    id: 2, 
    name: "Hoa lily trắng", 
    imageUrl: "/api/placeholder/300/300", 
    price: 350000, 
    originalPrice: 350000, 
    discount: 0,
    slug: "hoa-lily-trang"
  },
  { 
    id: 3, 
    name: "Giỏ hoa tulip", 
    imageUrl: "/api/placeholder/300/300", 
    price: 550000, 
    originalPrice: 650000, 
    discount: 15,
    slug: "gio-hoa-tulip"
  },
  { 
    id: 4, 
    name: "Hoa lan hồ điệp", 
    imageUrl: "/api/placeholder/300/300", 
    price: 750000, 
    originalPrice: 850000, 
    discount: 12,
    slug: "hoa-lan-ho-diep"
  },
  { 
    id: 5, 
    name: "Bó hoa cúc trắng", 
    imageUrl: "/api/placeholder/300/300", 
    price: 250000, 
    originalPrice: 250000, 
    discount: 0,
    slug: "bo-hoa-cuc-trang"
  },
  { 
    id: 6, 
    name: "Hoa hướng dương", 
    imageUrl: "/api/placeholder/300/300", 
    price: 400000, 
    originalPrice: 450000, 
    discount: 11,
    slug: "hoa-huong-duong"
  },
  { 
    id: 7, 
    name: "Lẵng hoa mix", 
    imageUrl: "/api/placeholder/300/300", 
    price: 600000, 
    originalPrice: 700000, 
    discount: 14,
    slug: "lang-hoa-mix"
  },
  { 
    id: 8, 
    name: "Hoa cẩm tú cầu", 
    imageUrl: "/api/placeholder/300/300", 
    price: 480000, 
    originalPrice: 520000, 
    discount: 8,
    slug: "hoa-cam-tu-cau"
  }
];
function FeaturedProducts() {
  
  
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm nổi bật</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/products" className="inline-block px-6 py-2 border-2 border-pink-600 text-pink-600 font-medium rounded-md hover:bg-pink-600 hover:text-white transition-colors">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;