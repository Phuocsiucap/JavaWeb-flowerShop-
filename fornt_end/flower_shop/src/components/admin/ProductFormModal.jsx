// src/components/admin/ProductFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Link } from 'lucide-react';

const ProductFormModal = ({ isOpen, onClose, onSave, product, categories }) => {
  const initialFormData = {
    // Removed id field as it's automatically generated
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    discount: 0,
    category: '',
    occasion: '',
    stock: 0
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');

  // Initialize form data if editing an existing product
  useEffect(() => {
    if (product) {
      setFormData({
        // Keep id for existing products (for updating), but don't show in form
        ...(product.id ? { id: product.id } : {undefined}),
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        imageUrl: product.imageUrl || '',
        discount: product.discount || 0,
        category: product.category || '',
        occasion: product.occasion || '',
        stock: product.stock || 0
      });
      
      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
      }
    }
  }, [product]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    
    // Convert numeric strings to numbers
    if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Handle image URL preview
    if (name === 'imageUrl' && value) {
      setImagePreview(value);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm không được để trống';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Giá phải lớn hơn 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }
    
    if (formData.stock < 0) {
      newErrors.stock = 'Số lượng tồn kho không thể âm';
    }
    
    if (formData.discount < 0 || formData.discount > 1) {
      newErrors.discount = 'Giảm giá phải từ 0 đến 1 (0% đến 100%)';
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Call onSave function from parent component
    onSave(formData);
    console.log(formData) 
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Nhập tên sản phẩm"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded-md"
                placeholder="Nhập mô tả sản phẩm"
              />
            </div>
            
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.price ? 'border-red-500' : ''}`}
                placeholder="Nhập giá sản phẩm"
                min="0"
                step="1000"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            
            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giảm giá
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.discount ? 'border-red-500' : ''}`}
                  placeholder="0.1 = 10%"
                  min="0"
                  max="1"
                  step="0.01"
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
              {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="">Chọn danh mục</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="new">+ Thêm danh mục mới</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Occasion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dịp
              </label>
              <select
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Chọn dịp</option>
                <option value="birthday">Sinh nhật</option>
                <option value="wedding">Đám cưới</option>
                <option value="anniversary">Kỷ niệm</option>
                <option value="congratulation">Chúc mừng</option>
                <option value="sympathy">Chia buồn</option>
                <option value="love">Tình yêu</option>
                <option value="holiday">Ngày lễ</option>
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.stock ? 'border-red-500' : ''}`}
                placeholder="Nhập số lượng tồn kho"
                min="0"
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>

            {/* Image URL Input */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đường dẫn hình ảnh
              </label>
              <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="flex-1">
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <span className="bg-gray-100 px-3 py-2 text-gray-500 border-r">
                      <Link size={18} />
                    </span>
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="flex-1 p-2 outline-none"
                      placeholder="Nhập đường dẫn URL hình ảnh"
                    />
                  </div>
                  {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>}
                </div>

                {/* Image preview */}
                {imagePreview && (
                  <div className="relative h-24 w-24 mt-3 md:mt-0 border rounded-md overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/96/96";
                        setErrors({...errors, imageUrl: 'Không thể tải hình ảnh. Kiểm tra lại URL.'});
                      }}
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center"
                      onClick={() => {
                        setImagePreview('');
                        setFormData({ ...formData, imageUrl: '' });
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-2 flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {product ? 'Cập nhật' : 'Thêm sản phẩm'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;