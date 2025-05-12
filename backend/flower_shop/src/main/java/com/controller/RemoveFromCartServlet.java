package com.controller;

import com.model.Cart;
import com.model.CartItem;
import com.model.User;
import com.dao.CartDAO;
import com.dao.UserDao;
import com.service.AuthService;
import com.service.AuthServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;

@WebServlet("/api/cart/remove/*")
public class RemoveFromCartServlet extends CartController {
    private static final long serialVersionUID = 1L;
    private static final AuthService authService = new AuthServiceImpl(new UserDao());
    private static final CartDAO cartDAO = new CartDAO();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void init() throws ServletException {
        super.init();
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
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
            User user = userOptional.get();
            String userId = user.getId();

            Optional<Cart> cartOptional = cartDAO.findByUserID(userId);
            if (!cartOptional.isPresent()) {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "Giỏ hàng không tồn tại");
                return;
            }
            Cart cart = cartOptional.get();

            String pathInfo = request.getPathInfo();
            if (pathInfo == null || pathInfo.length() <= 1) {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "Thiếu productId để xóa");
                return;
            }

            String productIdStr = pathInfo.substring(1);
            int productId;
            try {
                productId = Integer.parseInt(productIdStr);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "productId không hợp lệ");
                return;
            }

            Optional<CartItem> cartItemOptional = cartDAO.findCartItemByProductId(cart.getCartId(), productId);
            if (!cartItemOptional.isPresent()) {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "Sản phẩm không có trong giỏ hàng");
                return;
            }

            cartDAO.deleteCartItem(cart.getCartId(), productId);

            cart = cartDAO.findByUserID(userId).orElse(cart);

            sendSuccessResponse(response, cart);

        } catch (Exception e) {
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Lỗi server: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doDelete(request, response);
    }

    private void sendSuccessResponse(HttpServletResponse response, Cart cart) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        objectMapper.writeValue(response.getWriter(), cart);
    }

    private static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}