import React from 'react';
import { Link } from 'react-router-dom';

function Occasions() {
  const occasions = [
    { id: 1, name: "Sinh nhật", imageUrl: "/api/placeholder/400/200", slug: "sinh-nhat" },
    { id: 2, name: "Ngày cưới", imageUrl: "/api/placeholder/400/200", slug: "ngay-cuoi" },
    { id: 3, name: "Ngày 8/3", imageUrl: "/api/placeholder/400/200", slug: "ngay-8-3" },
    { id: 4, name: "Ngày 20/10", imageUrl: "/api/placeholder/400/200", slug: "ngay-20-10" },
    { id: 5, name: "Valentine", imageUrl: "/api/placeholder/400/200", slug: "valentine" },
    { id: 6, name: "Tết", imageUrl: "/api/placeholder/400/200", slug: "tet" }
  ];
  
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dịp tặng hoa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {occasions.map(occasion => (
            <Link 
              key={occasion.id} 
              to={`/occasion/${occasion.slug}`}
              className="relative overflow-hidden rounded-lg shadow-md group"
            >
              <img 
                src={occasion.imageUrl} 
                alt={occasion.name} 
                className="w-full h-40 object-cover transition-transform group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <h3 className="text-white font-medium text-lg p-4">{occasion.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Occasions;