package com.service;

import com.dao.UserDao;
import com.dto.request.LoginRequest;
import com.dto.request.RegisterRequest;
import com.dto.request.UpdateRequest;
import com.dto.response.AuthResponse;
import com.model.User;
import com.util.JwtUtil;
import com.util.PasswordUtil;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static com.util.JwtUtil.generateToken;


public class AuthServiceImpl implements AuthService {
    private final UserDao userDao;

    public AuthServiceImpl(UserDao userDao) {
        this.userDao = userDao;
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
        String token = generateToken(user);
        return AuthResponse.builder()
                .message("Login successful")
                .data(Map.of("token", token)) // dùng Map để bao token vào object
                .build();
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
    public AuthResponse update(UpdateRequest request, String token) {
        Optional<User> optionalUser = getUserFromToken(token);
        if (optionalUser.isEmpty()) {
            return AuthResponse.builder()
                    .message("Invalid token or user not found")
                    .data(Map.of())
                    .build();
        }

        User user = optionalUser.get();

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