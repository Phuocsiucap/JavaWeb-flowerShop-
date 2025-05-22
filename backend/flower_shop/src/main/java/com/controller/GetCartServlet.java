package com.controller;

import com.dao.UserDao;
import com.model.Cart;
import com.model.CartItem;
import com.model.User;
import com.service.AuthService;
import com.service.AuthServiceImpl;
import com.util.DatabaseConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Servlet để lấy thông tin giỏ hàng
 */
@WebServlet("/api/cart")
public class GetCartServlet extends CartController {
    private static final long serialVersionUID = 1L;
    private static final AuthService authService = new AuthServiceImpl(new UserDao(), null);
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            // Xác thực người dùng qua token
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, 
                    "Thiếu hoặc không hợp lệ token xác thực");
                return;
            }

            String token = authHeader.substring(7);
            Optional<User> userOptional = authService.getUserFromToken(token);
            if (!userOptional.isPresent()) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, 
                    "Token không hợp lệ hoặc người dùng không tồn tại");
                return;
            }
            String userId = userOptional.get().getId();

            // Lấy hoặc tạo giỏ hàng
            Cart cart = cartService.getOrCreateCart(userId);
            // Lấy items
            String itemSql = "SELECT * FROM cartitem WHERE cartId = ?";
            List<CartItem> items = new ArrayList<>();
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(itemSql)) {
                stmt.setInt(1, cart.getCartId());
                ResultSet rs = stmt.executeQuery();
                while (rs.next()) {
                    CartItem item = new CartItem(
                        rs.getInt("productId"),
                        rs.getString("name"),
                        rs.getDouble("price"),
                        rs.getInt("quantity"),
                        rs.getString("imageUrl")
                    );
                    item.setCartId(rs.getInt("cartId"));
                    items.add(item);
                }
            }

            // Tạo phản hồi
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("cart", cart);
            responseData.put("items", items);
            sendSuccessResponse(response, responseData);
        } catch (Exception e) {
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Có lỗi xảy ra khi lấy giỏ hàng: " + e.getMessage());
        }
    }

    private void sendSuccessResponse(HttpServletResponse response, Map<String, Object> data) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        objectMapper.writeValue(response.getWriter(), data);
    }
}