import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ui/ProductCard';
import { useState } from 'react';


function FeaturedProducts() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);


  
  useEffect(() => {
    // Fetch products from backend
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/flower_shop/products/');

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data);

        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((product) => product.category))];

        setCategories(uniqueCategories);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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