import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/layout/ScrollToTop';
import Cookies from 'js-cookie';
import ProductCard from '../components/ui/ProductCard'; // Import ProductCard

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

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

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handlePriceChange = (event, index) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = parseInt(event.target.value);
    setPriceRange(newPriceRange);
  };

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((cat) => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const addToCart = async (productId) => {
    const token = Cookies.get('token');
    try {
      const response = await fetch('http://localhost:8080/flower_shop/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (!response.ok) {
        throw new Error('Failed to add product to cart');
      }

      alert('Sản phẩm đã được thêm vào giỏ hàng!');
    } catch (err) {
      alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      const response = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update wishlist');
      }

      // Update product wishlist status locally
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, inWishlist: !product.inWishlist } : product
        )
      );
    } catch (err) {
      alert('Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.');
    }
  };

  // Apply filters and sorting
  const filteredProducts = products.filter((product) => {
    // Price filter
    const price = product.price * (1 - (product.discount || 0) / 100);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(product.category);

    // Search query
    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPrice && matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'priceAsc':
        return a.price * (1 - (a.discount || 0) / 100) - b.price * (1 - (b.discount || 0) / 100);
      case 'priceDesc':
        return b.price * (1 - (b.discount || 0) / 100) - a.price * (1 - (a.discount || 0) / 100);
      case 'newest':
        return b.id - a.id; // Assuming newer products have higher IDs
      case 'featured':
      default:
        return 0; // No specific ordering for featured
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Sản phẩm</h1>

          {/* Search Bar */}
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full p-2 pl-10 border border-gray-300 rounded-full"
              value={searchQuery}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters - Mobile Toggle */}
          <button
            className="lg:hidden flex items-center justify-between w-full p-4 bg-white border rounded mb-4"
            onClick={toggleFilter}
          >
            <div className="flex items-center">
              <Filter size={18} className="mr-2" />
              <span className="font-medium">Bộ lọc</span>
            </div>
            {filterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {/* Filters - Sidebar */}
          <div className={`lg:block ${filterOpen ? 'block' : 'hidden'} lg:w-1/4 bg-white p-4 rounded border`}>
            <h2 className="text-xl font-bold mb-4">Bộ lọc</h2>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Khoảng giá</h3>
              <div className="flex justify-between mb-2">
                <span>{priceRange[0].toLocaleString('vi-VN')}đ</span>
                <span>{priceRange[1].toLocaleString('vi-VN')}đ</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000000"
                step="50000"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                className="w-full mb-2"
              />
              <input
                type="range"
                min="0"
                max="2000000"
                step="50000"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                className="w-full"
              />
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Danh mục</h3>
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${index}`}
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="mr-2"
                    />
                    <label htmlFor={`category-${index}`}>{category}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product List */}
          <div className="lg:w-3/4">
            {/* Sort Options */}
            <div className="flex justify-between items-center mb-6 bg-white p-3 rounded border">
              <div className="text-sm">{sortedProducts.length} sản phẩm</div>
              <div className="flex items-center">
                <span className="mr-2 text-sm">Sắp xếp theo:</span>
                <select
                  className="border p-1 rounded text-sm"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="featured">Nổi bật</option>
                  <option value="newest">Mới nhất</option>
                  <option value="priceAsc">Giá tăng dần</option>
                  <option value="priceDesc">Giá giảm dần</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                  toggleWishlist={toggleWishlist}
                />
              ))}
            </div>

            {/* Empty State */}
            {sortedProducts.length === 0 && (
              <div className="bg-white p-8 rounded border text-center">
                <div className="text-xl font-medium mb-2">Không tìm thấy sản phẩm</div>
                <p className="text-gray-500">
                  Vui lòng thử lại với bộ lọc khác hoặc từ khóa tìm kiếm khác.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default ProductPage;