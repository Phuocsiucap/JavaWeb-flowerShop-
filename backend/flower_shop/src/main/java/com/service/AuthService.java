package com.service;

import com.dto.request.LoginRequest;
import com.dto.request.RegisterRequest;
import com.dto.request.UpdateRequest;
import com.dto.response.AuthResponse;
import com.model.User;

import java.util.Optional;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse update(UpdateRequest request, User user);
    Optional<User> getUserFromToken(String token);
    Optional<User> getUserById(String id);
}