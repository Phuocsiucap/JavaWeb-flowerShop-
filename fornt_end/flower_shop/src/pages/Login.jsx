import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";  
import Header from "../components/layout/Header";


const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Lấy login từ AuthContext
  const { login } = useContext(AuthContext);

  const loginWithEmail = async () => {
    setIsLoading(true);
    setError("");

    try {
      const userData = await login(email, password);  // Gọi login từ AuthContext

      if (userData) {
        navigate("/");  // Nếu đăng nhập thành công, điều hướng về trang chủ
      }
    } catch (err) {
      setError("Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="min-h-screen flex items-center justify-center bg-cover bg-top px-4"
      style={{ backgroundImage: 'url("login_image.png")' }}
    >

      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h1>
          <p className="text-gray-600">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={loginWithEmail}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
          <Link
            to="/register"
            className="w-full block text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
          >
            Đăng ký tài khoản
          </Link>
        </div>
      </div>
    </div>
      </main>
     
   
    </div>
    
  );
};

export default LoginPage;
