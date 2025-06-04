import React from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../config';

function Categories() {
  const categories = [
    { id: 1, name: "Hoa tươi", imageUrl: "/images/categori_hoatuoi.jpg", slug: "hoa-tuoi" },
    { id: 2, name: "Hoa chậu", imageUrl: "/images/categori_hoachau.jpg", slug: "hoa-chau" },
    { id: 3, name: "Hoa cưới", imageUrl: "/images/categori_hoacuoi.jpg", slug: "hoa-cuoi" },
    { id: 4, name: "Hoa sự kiện", imageUrl: "/images/categori_hoasukien.jpg", slug: "hoa-su-kien" },
    { id: 5, name: "Quà tặng kèm", imageUrl: "/images/categori_quatangkem.jpg", slug: "qua-tang-kem" }
  ];
  
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh mục sản phẩm</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(category => (
            <Link 
              key={category.id} 
              to={`/category/${category.slug}`} 
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
            >
              <img src={category.imageUrl} alt={category.name} className="w-full h-40 object-cover" />
              <div className="p-4 text-center">
                <h3 className="font-medium text-gray-800">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;