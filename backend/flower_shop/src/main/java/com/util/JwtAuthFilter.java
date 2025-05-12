package com.util;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;

@WebFilter(filterName = "JwtAuthFilter", urlPatterns = {"/api/auth/me", "/api/auth/logout", "/api/auth/update-profile", "/api/auth/*"})
public class JwtAuthFilter implements Filter {
	 private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
    	// Cho phép login, register không cần token
    	HttpServletRequest req = (HttpServletRequest) request;
    	HttpServletResponse res = (HttpServletResponse) response;
    	
    	// Xử lý CORS header (nếu chưa gộp)
    	res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    	res.setHeader("Access-Control-Allow-Credentials", "true");

    	// Nếu là preflight request, trả 200 OK luôn
    	if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
    	    res.setStatus(HttpServletResponse.SC_OK);
    	    return;
    	}

        String path = req.getRequestURI();
        if (path.endsWith("/login") || path.endsWith("/register")) {
            chain.doFilter(request, response);
            return;
        }
        
        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendErrorResponse(res, "Unauthorized access", HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);  // Lấy token từ header Authorization
            try {
                DecodedJWT jwt = JwtUtil.verifyToken(token);
                String userId = jwt.getSubject();
                System.out.println(userId);
                String role = jwt.getClaim("role").asString();

                req.setAttribute("role", role);
                req.setAttribute("userId", userId);
                System.out.print("enable");
                chain.doFilter(request, response);
                return;
            } catch (Exception e) {
            	 e.printStackTrace();
                sendErrorResponse(res, "invalid token", HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

        }

        // Nếu không có token, trả lỗi 401
        sendErrorResponse(res, "Missing token", HttpServletResponse.SC_UNAUTHORIZED);
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
