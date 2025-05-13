import React from 'react';

const TopProductsList = ({ products }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">Sản phẩm bán chạy</h2>
      <ul className="space-y-4">
        {products.map((product, index) => (
          <li key={product.id} className="flex items-center justify-between">
            <div className="flex">
              <div className="w-10 h-10 bg-pink-100 rounded-md flex items-center justify-center mr-3">
                <span className="text-pink-500">{index + 1}</span>
              </div>
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">Đã bán: {product.sold}</p>
              </div>
            </div>
            <p className="font-medium">₫{product.price.toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopProductsList;
