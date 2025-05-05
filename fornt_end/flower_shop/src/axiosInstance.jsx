import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/flower_shop_war_exploded',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để tự động gắn token nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
