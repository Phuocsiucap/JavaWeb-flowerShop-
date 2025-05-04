package com.controller;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.dao.UserDao;
import com.dto.request.LoginRequest;
import com.dto.request.RegisterRequest;
import com.dto.response.AuthResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.model.User;
import com.service.AuthService;
import com.service.AuthServiceImpl;
import com.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


import java.io.IOException;
import java.util.Base64;
import java.util.Optional;


@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {
    private final AuthService authService;
    private final ObjectMapper objectMapper;

    public AuthServlet() {
        this.authService = new AuthServiceImpl(new UserDao());
        this.objectMapper = new ObjectMapper();
    }
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        if ("/me".equals(pathInfo)) {
            String authHeader = req.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Optional<User> userOptional = authService.getUserFromToken(token);
                if (userOptional.isPresent()) {
                    sendJsonResponse(resp, userOptional.get());
                } else {
                    sendErrorResponse(resp, "Invalid or expired token");
                }
            } else {
                sendErrorResponse(resp, "Missing Authorization header");
            }
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            resp.getWriter().write("Endpoint not found");
        }
    }


    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        if ("/register".equals(pathInfo)) {
            System.out.println("register is calling ");
            RegisterRequest request = objectMapper.readValue(req.getInputStream(), RegisterRequest.class);
            System.out.println(objectMapper.writeValueAsString(request));
            AuthResponse response = authService.register(request);
            resp.setContentType("application/json");
            resp.getWriter().write(objectMapper.writeValueAsString(response));
        } else if ("/login".equals(pathInfo)) {
            LoginRequest request = objectMapper.readValue(req.getInputStream(), LoginRequest.class);
            AuthResponse response = authService.login(request);
            resp.setContentType("application/json");
            resp.getWriter().write(objectMapper.writeValueAsString(response));
        } else if ("/logout".equals(pathInfo)) {
            // Vì dùng JWT nên không cần xử lý gì phức tạp, chỉ cần client xóa token
            AuthResponse response = AuthResponse.builder().message("Logged out").build();
            sendJsonResponse(resp, response);
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            resp.getWriter().write("Endpoint not found");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        if ("/update-profile".equals(pathInfo)) {
            String authHeader = req.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Optional<User> userOptional = authService.getUserFromToken(token);
                if (userOptional.isPresent()) {
                    User userFromToken = userOptional.get();
                    User updatedData = objectMapper.readValue(req.getInputStream(), User.class);

                    // Cập nhật dữ liệu profile mới
                    userFromToken.setName(updatedData.getName());
                    userFromToken.setPhone(updatedData.getPhone());
                    userFromToken.setAddress(updatedData.getAddress());

                    // Cập nhật thông tin người dùng trong cơ sở dữ liệu
                    new UserDao().update(userFromToken);
                    sendJsonResponse(resp, userFromToken);
                } else {
                    sendErrorResponse(resp, "Invalid or expired token");
                }
            } else {
                sendErrorResponse(resp, "Missing Authorization header");
            }
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            resp.getWriter().write("Endpoint not found");
        }
    }


    private void sendJsonResponse(HttpServletResponse response, Object data) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(), data);
    }

    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        AuthResponse errorResponse = AuthResponse.builder()
                .message(message)
                .build();
        sendJsonResponse(response, errorResponse);
    }


}