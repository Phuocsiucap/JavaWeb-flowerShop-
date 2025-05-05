import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";  // Import AuthContext

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Lấy register từ AuthContext
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setMsg("Lỗi: Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);
    setMsg("");

    try {
      const userData = await register(email, password, name); // Gọi register từ AuthContext

      if (userData) {
        setMsg("Đăng ký thành công!");
        setTimeout(() => navigate("/login"), 2000); // Chuyển hướng về trang login
      }
    } catch (err) {
      setMsg(`Lỗi: ${err.message || "Không thể đăng ký"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: "url('/login.png')" }}
    >
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng ký tài khoản</h1>
          <p className="text-gray-600">Tạo tài khoản mới để trải nghiệm dịch vụ</p>
        </div>

        {msg && (
          <div
            className={`p-4 rounded-md mb-6 text-sm ${
              msg.startsWith("Lỗi") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}
          >
            {msg}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          {isLoading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
