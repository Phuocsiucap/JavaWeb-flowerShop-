// src/components/admin/DeleteConfirmModal.jsx
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemCount, itemType }) => {
  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-red-600">Xác nhận xóa</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium mb-2">
              {itemCount > 1 
                ? `Bạn có chắc chắn muốn xóa ${itemCount} ${itemType} đã chọn?` 
                : `Bạn có chắc chắn muốn xóa ${itemType} này?`
              }
            </h3>
            <p className="text-gray-500 text-sm">
              Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;