package com.service;

import com.dto.request.LoginRequest;
import com.dto.request.RegisterRequest;
import com.dto.response.AuthResponse;
import com.model.User;

import java.util.Optional;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    Optional<User> getUserFromToken(String token);
}