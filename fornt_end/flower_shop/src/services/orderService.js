const API_URL = '/api';

export const orderService = {
  /**
   * Lấy thông tin giỏ hàng hiện tại
   * @returns {Promise} - Promise chứa dữ liệu giỏ hàng
   */
  getCart: async () => {
    try {
      const response = await fetch(`${API_URL}/cart`);
      if (!response.ok) {
        throw new Error('Không thể lấy thông tin giỏ hàng');
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      throw error;
    }
  },

  /**
   * Gửi đơn hàng đến CheckoutServlet
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @returns {Promise} - Promise chứa kết quả từ server
   */
  submitOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi xử lý đơn hàng');
      }

      return await response.json();
    } catch (error) {
      console.error('Lỗi khi gửi đơn hàng:', error);
      throw error;
    }
  },

  /**
   * Gửi thông tin thanh toán đến PaymentServlet
   * @param {Object} paymentData - Dữ liệu thanh toán
   * @returns {Promise} - Promise chứa kết quả từ server
   */
  processPayment: async (paymentData) => {
    try {
      const response = await fetch(`${API_URL}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi xử lý thanh toán');
      }

      return await response.json();
    } catch (error) {
      console.error('Lỗi khi xử lý thanh toán:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra trạng thái đơn hàng
   * @param {string} orderId - ID của đơn hàng
   * @returns {Promise} - Promise chứa thông tin trạng thái đơn hàng
   */
  checkOrderStatus: async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`);
      if (!response.ok) {
        throw new Error('Không thể kiểm tra trạng thái đơn hàng');
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái đơn hàng:', error);
      throw error;
    }
  }
};