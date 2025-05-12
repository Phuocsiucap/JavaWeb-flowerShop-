package com.controller;

import com.dao.UserDao;
import com.dto.request.UserSearchRequest;
import com.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.google.gson.Gson;
import com.mapper.UserMapper;
import com.model.User;
import com.service.CustomManagementService;
import com.service.CustomManagementServiceImpl;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@WebServlet("/api/admin/management/users/*")
public class CustomManagementController extends HttpServlet {
    private final CustomManagementService managementService;
    private final ObjectMapper objectMapper;

    public CustomManagementController() {
        this.managementService = new CustomManagementServiceImpl(new UserDao());
        this.objectMapper = new ObjectMapper();
        
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();

        if (pathInfo == null || "/".equals(pathInfo)) {
            // Get all users with filtering
            String searchTerm = req.getParameter("search");
            String role = req.getParameter("role");
            String status = req.getParameter("status");
            
            UserSearchRequest searchRequest = new UserSearchRequest();
            searchRequest.setSearchTerm(searchTerm);
            searchRequest.setRole(role);
            searchRequest.setStatus(status);
            
            List<User> users = managementService.getUsers(searchRequest);
            
            
            sendJsonResponse(resp, ApiResponse.builder()
                    .success(true)
                    .message("Users retrieved successfully")                 
                    .data(Map.of("users", UserMapper.toMapList(users)))
                    .build());
        } else {
            // Get specific user by ID
            String userId = pathInfo.substring(1);
            Optional<User> user = managementService.getUserById(userId);
            
            if (user.isPresent()) {
                sendJsonResponse(resp, ApiResponse.builder()
                        .success(true)
                        .message("User retrieved successfully")
                        .data(Map.of("user", UserMapper.toMap(user.get())))
                        .build());
            } else {
                sendErrorResponse(resp, "User not found", HttpServletResponse.SC_NOT_FOUND);
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        
        try {
            User newUser = objectMapper.readValue(req.getInputStream(), User.class);
            User createdUser = managementService.createUser(newUser);
            
            sendJsonResponse(resp, ApiResponse.builder()
                    .success(true)
                    .message("User created successfully")
                    .data(Map.of("user", UserMapper.toMap(createdUser)))
                    .build(), HttpServletResponse.SC_CREATED);
        } catch (Exception e) {
            sendErrorResponse(resp, "Failed to create user: " + e.getMessage(), HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        
        if (pathInfo == null || "/".equals(pathInfo)) {
            sendErrorResponse(resp, "User ID is required", HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        String userId = pathInfo.substring(1);
        try {
            User updatedUser = objectMapper.readValue(req.getInputStream(), User.class);
            updatedUser.setId(userId); // Ensure ID matches path
            
            boolean success = managementService.updateUser(updatedUser);
            
            if (success) {
                sendJsonResponse(resp, ApiResponse.builder()
                        .success(true)
                        .message("User updated successfully")
                        .data(Map.of("user", UserMapper.toMap(updatedUser)))
                        .build());
            } else {
                sendErrorResponse(resp, "User not found or could not be updated", HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            sendErrorResponse(resp, "Failed to update user: " + e.getMessage(), HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
       
        
        
        if (pathInfo == null || "/".equals(pathInfo)) {
            sendErrorResponse(resp, "User ID is required", HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        String userId = pathInfo.substring(1);
        boolean success = managementService.deleteUser(userId);
        
        if (success) {
            sendJsonResponse(resp, ApiResponse.builder()
                    .success(true)
                    .message("User deleted successfully")
                    .build());
        } else {
            sendErrorResponse(resp, "User not found or could not be deleted", HttpServletResponse.SC_NOT_FOUND);
        }
    }

    private void sendJsonResponse(HttpServletResponse response, Object data) throws IOException {
        sendJsonResponse(response, data, HttpServletResponse.SC_OK);
    }

    private void sendJsonResponse(HttpServletResponse response, Object data, int status) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(status);
        objectMapper.writeValue(response.getOutputStream(), data);
    }

    private void sendErrorResponse(HttpServletResponse response, String message, int status) throws IOException {
        response.setStatus(status);
        ApiResponse errorResponse = ApiResponse.builder()
                .success(false)
                .message(message)
                .build();
        sendJsonResponse(response, errorResponse, status);
    }
}