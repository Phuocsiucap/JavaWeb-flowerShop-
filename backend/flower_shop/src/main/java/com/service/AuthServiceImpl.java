package com.service;

import com.dao.OrderDAO;
import com.dao.UserDao;
import com.dto.request.LoginRequest;
import com.dto.request.RegisterRequest;
import com.dto.request.UpdateRequest;
import com.dto.response.AuthResponse;
import com.mapper.UserMapper;
import com.model.Order;
import com.model.User;
import com.util.JwtUtil;
import com.util.PasswordUtil;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static com.util.JwtUtil.generateToken;

public class AuthServiceImpl implements AuthService {
    private final UserDao userDao;
    private final OrderDAO orderDAO; // Dependency để gọi updateOrderStatus

    public AuthServiceImpl(UserDao userDao, OrderDAO orderDAO) {
        this.userDao = userDao;
        this.orderDAO = orderDAO;
    }

    @Override
    public Optional<User> getUserById(String id) {
        try {
            return userDao.findById(id);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    @Override
    public Optional<User> getUserFromToken(String token) {
        try {
            String email = JwtUtil.verifyToken(token).getClaim("email").asString();
            return userDao.findByEmail(email);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        Optional<User> existingUser = userDao.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("User already exists");
        }
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(PasswordUtil.hashPassword(request.getPassword()));

        userDao.save(user);

        return AuthResponse.builder()
                .message("User registered successfully")
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Optional<User> userOptional = userDao.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        if (!PasswordUtil.checkPassword(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        if ("blocked".equals(user.getStatus())) {
            return AuthResponse.builder()
                    .message("login unsuccessful, your account was blocked. Please contact with 0397826216 or nguyenvanphuoc@gmail.com")
                    .data(null)
                    .build();
        }
        String token = generateToken(user);
        user.setStatus("active");
        user.setLastLogin(LocalDateTime.now());
        userDao.update(user);
        return AuthResponse.builder()
                .message("Login successful")
                .data(Map.of("token", token))
                .build();
    }

    @Override
    public AuthResponse update(UpdateRequest request, User user) {
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getName() != null) user.setName(request.getName());

        userDao.update(user);

        return AuthResponse.builder()
                .message("User updated successfully")
                .data(Map.of("user", UserMapper.toMap(user)))
                .build();
    }
    
    @Override
    public void logout(String userId) {
        Optional<User> optionalUser = userDao.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setStatus("inactive");
            userDao.update(user);
        }
    }

    // Phương thức updateOrderStatus với kiểm tra quyền và trạng thái
    public boolean updateOrderStatus(int orderId, String status, String userId) {
        try {
            // Lấy thông tin đơn hàng
            Order order = orderDAO.getOrderById(orderId);
            if (order == null) {
                System.out.println("Order not found for ID: " + orderId);
                return false;
            }

            // Kiểm tra quyền truy cập
            Optional<User> userOpt = getUserById(userId);
            if (!userOpt.isPresent() || (!userId.equals(order.getUserId()) && !"admin".equals(userOpt.get().getRole()))) {
                System.out.println("Unauthorized access for user: " + userId);
                return false;
            }

            // Kiểm tra trạng thái hợp lệ
            if ("Success".equals(status) && !"Đang xử lý".equals(order.getStatus())) {
                System.out.println("Invalid status transition: Only 'Đang xử lý' can be updated to 'Success'");
                return false;
            }
            if ("Cancelled".equals(status) && !"Đang xử lý".equals(order.getStatus())) {
                System.out.println("Invalid status transition: Only 'Đang xử lý' can be updated to 'Cancelled'");
                return false;
            }

            // Gọi OrderDAO để cập nhật trạng thái
            return orderDAO.updateOrderStatus(orderId, status);
        } catch (Exception e) {
            System.err.println("Error updating order status in AuthService: " + e.getMessage());
            return false;
        }
    }
}