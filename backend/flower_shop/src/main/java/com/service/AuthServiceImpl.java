package com.service;

import com.dao.UserDao;
import com.dto.request.LoginRequest;
import com.dto.request.RegisterRequest;
import com.dto.request.UpdateRequest;
import com.dto.response.AuthResponse;
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

    public AuthServiceImpl(UserDao userDao) {
        this.userDao = userDao;
    }

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
        System.out.println(request);
//        User user = UserMapper.INSTANCE.toEntity(request);
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(PasswordUtil.hashPassword(request.getPassword()));


        System.out.println(user);
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
        if("blocked".equals(user.getStatus())) {
     
        	return AuthResponse.builder()
                    .message("login unsuccessful, your accout was blocked. Please contact with 0397826216 or nguyenvanphuoc@gmail.com")
                    .data(null) // dùng Map để bao token vào object
                    .build();
        }
        String token = generateToken(user);
        user.setStatus("active");
    	user.setLastLogin(LocalDateTime.now());
    	userDao.update(user);
        return AuthResponse.builder()
                .message("Login successful")
                .data(Map.of("token", token)) // dùng Map để bao token vào object
                .build();
    }

  

    @Override
    public AuthResponse update(UpdateRequest request, User user) {
   
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getName() != null) user.setName(request.getName());

        userDao.update(user);
        System.out.println("User updated successfully");

        return AuthResponse.builder()
                .message("User updated successfully")
                .data(Map.of("user", user))
                .build();
    }

}