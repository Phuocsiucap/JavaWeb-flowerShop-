// components/admin/PageHeader.js
import React from 'react';

const PageHeader = ({ title, description }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      {description && <p className="text-gray-600 mt-2">{description}</p>}
    </div>
  );
};

export default PageHeader;