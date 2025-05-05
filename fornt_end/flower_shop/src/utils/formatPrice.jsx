// src/utils/formatPrice.js

export const formatPrice = (price) => {
    // Ensure the price is a number
    const formattedPrice = parseFloat(price);
  
    if (isNaN(formattedPrice)) {
      return 'Invalid Price';
    }
  
    // Format the price as a currency string with commas and a currency symbol
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(formattedPrice);
  };
  