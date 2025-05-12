// src/pages/admin/ProductsPage.jsx
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

import {
  Search,
  Plus,
  Edit,
  Trash,
  Filter,
  ArrowUpDown,
  Loader,
  X,
} from "lucide-react";
import ProductFormModal from "../../components/admin/ProductFormModal";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { toast } from "react-toastify";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productsToDelete, setProductsToDelete] = useState([]);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8080/flower_shop/products/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
      setTotalProducts(data.length);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(data.map((product) => product.category)),
      ];
      setCategories(uniqueCategories);

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch products. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Format price to VND currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Toggle select all products
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  // Toggle select single product
  const toggleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // Open edit modal
  const handleEdit = (product) => {
    setCurrentProduct(product);
    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal for single product
  const handleDelete = (product) => {
    setProductsToDelete([product.id]);
    setIsDeleteModalOpen(true);
  };

  // Open delete confirmation modal for bulk delete
  const handleBulkDelete = () => {
    setProductsToDelete([...selectedProducts]);
    setIsDeleteModalOpen(true);
  };

  // Handle product save (create or update)
  const handleSaveProduct = async (formData) => {
    try {
      let url = "http://localhost:8080/flower_shop/products/";
      let method = "POST";

      // If editing an existing product, update the URL and method
      if (formData.get('id')) {
        url += formData.get('id');
        method = "PUT";
      }

      const token = localStorage.getItem("token");
      
      const response = await fetch(url, {
        method: method,
        headers: {
          // No need to set Content-Type, browser will set it automatically for FormData
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const text = await response.text(); // thêm để debug
        console.error("Lỗi server:", text);
        throw new Error("Failed to save product");
      }

      await fetchProducts();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      toast.success(
        formData.get('id')
          ? "Sản phẩm đã được cập nhật thành công"
          : "Sản phẩm đã được thêm thành công"
      );
      setCurrentProduct(null);
    } catch (err) {
      console.error("Lỗi:", err);
      setError("Không thể lưu sản phẩm. Vui lòng thử lại sau.");
      toast.error("Có lỗi xảy ra khi lưu sản phẩm");
    }
  };

  // Handle product delete (single or bulk)
  const handleConfirmDelete = async () => {
    try {
      const deletePromises = productsToDelete.map((id) =>
        fetch(`http://localhost:8080/flower_shop/products/${id}`, {
          method: "DELETE",
        })
      );

      await Promise.all(deletePromises);

      // Refresh products list
      await fetchProducts();

      // Reset selected products
      setSelectedProducts(
        selectedProducts.filter((id) => !productsToDelete.includes(id))
      );

      // Show success message
      toast.success(
        productsToDelete.length > 1
          ? `${productsToDelete.length} sản phẩm đã được xóa thành công`
          : "Sản phẩm đã được xóa thành công"
      );

      // Close modal and reset state
      setIsDeleteModalOpen(false);
      setProductsToDelete([]);
    } catch (err) {
      setError("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
      toast.error("Có lỗi xảy ra khi xóa sản phẩm");
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;

    if (sortField === "price") {
      comparison = a.price - b.price;
    } else if (sortField === "stock") {
      comparison = a.stock - b.stock;
    } else if (sortField === "category") {
      comparison = a.category.localeCompare(b.category);
    } else {
      comparison = a.name.localeCompare(b.name);
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} className="mr-1" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Search and filters */}
        <div className="p-4 border-b flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                className="pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
            </div>
            <button
              className="border rounded-lg px-3 py-2 flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} className="mr-1" />
              <span>Lọc</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {selectedProducts.length > 0 && (
              <>
                <span className="text-sm text-gray-500">
                  Đã chọn {selectedProducts.length} sản phẩm
                </span>
                <button
                  className="text-red-600 bg-red-50 px-3 py-1 rounded-md text-sm"
                  onClick={handleBulkDelete}
                >
                  Xóa đã chọn
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  className="border rounded-md p-2 w-full"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 border-b">{error}</div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader size={40} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        onChange={toggleSelectAll}
                        checked={
                          selectedProducts.length > 0 &&
                          selectedProducts.length === currentProducts.length
                        }
                      />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        <span>Sản phẩm</span>
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center">
                        <span>Danh mục</span>
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center">
                        <span>Giá</span>
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("stock")}
                    >
                      <div className="flex items-center">
                        <span>Tồn kho</span>
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      THAO TÁC
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded text-blue-600 focus:ring-blue-500"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleSelectProduct(product.id)}
                        />
                      </td>
                     
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) =>
                                  (e.target.src = "/api/placeholder/40/40")
                                }
                              />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: #{product.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(product.price)}
                        {product.discount > 0 && (
                          <span className="ml-2 text-xs text-green-600">
                            -{product.discount * 100}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            product.stock > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {currentProducts.length === 0 && !loading && (
              <div className="p-12 text-center">
                <p className="text-gray-500 mb-4">
                  Không tìm thấy sản phẩm nào
                </p>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                  }}
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="px-4 py-3 flex items-center justify-between border-t">
                <div className="text-sm text-gray-500">
                  Hiển thị {indexOfFirstProduct + 1}-
                  {Math.min(indexOfLastProduct, filteredProducts.length)} trong
                  tổng số {filteredProducts.length} sản phẩm
                </div>
                <div className="flex space-x-1">
                  <button
                    className={`px-3 py-1 border rounded ${
                      currentPage === 1 ? "text-gray-400" : "hover:bg-gray-50"
                    }`}
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </button>

                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    // Show only 5 page numbers at a time
                    const pageToShow =
                      currentPage > 3
                        ? i + currentPage - 2 <= totalPages
                          ? i + currentPage - 2
                          : totalPages - 4 + i
                        : i + 1;

                    if (pageToShow > 0 && pageToShow <= totalPages) {
                      return (
                        <button
                          key={pageToShow}
                          className={`px-3 py-1 border rounded ${
                            currentPage === pageToShow
                              ? "bg-blue-50 text-blue-600"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => paginate(pageToShow)}
                        >
                          {pageToShow}
                        </button>
                      );
                    }
                    return null;
                  })}

                  <button
                    className={`px-3 py-1 border rounded ${
                      currentPage === totalPages
                        ? "text-gray-400"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      currentPage < totalPages && paginate(currentPage + 1)
                    }
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <ProductFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveProduct}
          categories={categories}
        />
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && currentProduct && (
        <ProductFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentProduct(null);
          }}
          onSave={handleSaveProduct}
          product={currentProduct}
          categories={categories}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setProductsToDelete([]);
          }}
          onConfirm={handleConfirmDelete}
          itemCount={productsToDelete.length}
          itemType="sản phẩm"
        />
      )}
    </div>
  );
};

export default ProductsPage;
