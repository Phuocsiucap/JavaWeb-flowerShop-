package com.util;

<<<<<<< HEAD
// JwtAuthFilter.java
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
=======
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
>>>>>>> f95840a (update authserverlet && generate customManagePage)
import java.io.IOException;

@WebFilter(filterName = "JwtAuthFilter", urlPatterns = {"/api/auth/*", "/api/cart/*"})
public class JwtAuthFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
    	HttpServletRequest req = (HttpServletRequest) request;
    	HttpServletResponse res = (HttpServletResponse) response;

    	// Cho phép login, register không cần token
        String path = req.getRequestURI();
        if (path.endsWith("/login") || path.endsWith("/register")) {
            chain.doFilter(request, response);
            return;
        }
     
        String authHeader = req.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);  // Lấy token từ header Authorization
            try {
                // Giải mã và xác thực token
                String userId = JwtUtil.verifyToken(token).getSubject();  // Giả sử verifyTokenAndGetUserId sẽ trả về userId sau khi xác thực thành công

                // Gán userId vào request để các servlet có thể sử dụng
                req.setAttribute("userId", userId);

                // Tiếp tục xử lý request
                chain.doFilter(request, response);
                return;
            } catch (Exception e) {
                // Nếu token không hợp lệ, trả lỗi 401
                ((HttpServletResponse) response).sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return;
            }
        }

        // Nếu không có token, trả lỗi 401
        ((HttpServletResponse) response).sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing token");
    }

    
}
