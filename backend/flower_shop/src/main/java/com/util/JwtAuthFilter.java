package com.util;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;

@WebFilter(filterName = "JwtAuthFilter", urlPatterns = {
    "/api/auth/me", "/api/auth/logout", "/api/auth/update-profile",
    "/api/auth/*", "/api/customer/orders/*", "/api/ordersreview/*", "/api/customer/orders/update-status"
})
public class JwtAuthFilter implements Filter {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // Set CORS headers
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Access-Control-Allow-Credentials", "true");

        // Handle CORS preflight request
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        String path = req.getRequestURI();

        // Bypass filter for GET /api/ordersreview/product/{productId}
        if ("GET".equalsIgnoreCase(req.getMethod()) && path.matches(".*/api/ordersreview/product/\\d+$")) {
            chain.doFilter(request, response);
            return;
        }

        // Bypass filter for login and register
        if (path.endsWith("/login") || path.endsWith("/register")) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendErrorResponse(res, "Unauthorized access", HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        try {
            String token = authHeader.substring(7);
            DecodedJWT jwt = JwtUtil.verifyToken(token);
            String userId = jwt.getSubject();
            String role = jwt.getClaim("role").asString();

            req.setAttribute("role", role);
            req.setAttribute("userId", userId);

            chain.doFilter(request, response);
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(res, "Invalid token", HttpServletResponse.SC_UNAUTHORIZED);
        }
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