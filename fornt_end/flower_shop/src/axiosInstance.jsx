import axios from 'axios';
import Cookies from 'js-cookie';
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/flower_shop',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để tự động gắn token nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
