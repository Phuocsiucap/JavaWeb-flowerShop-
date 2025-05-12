package com.controller;

import com.model.Cart;
import com.model.CartItem;
import com.model.User;
import com.model.Product;
import com.dao.UserDao;
import com.dao.CartDAO;
import com.dao.ProductDAOImpl;
import com.service.AuthService;
import com.service.AuthServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;

/**
 * Servlet để thêm sản phẩm vào giỏ hàng, lưu vào database
 */
@WebServlet("/api/cart/add")
public class AddToCartServlet extends CartController {
    private static final long serialVersionUID = 1L;
    private static final AuthService authService = new AuthServiceImpl(new UserDao());
    private static final CartDAO cartDAO = new CartDAO();
    private static final ProductDAOImpl productDAO = new ProductDAOImpl();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void init() throws ServletException {
        super.init();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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
            User user = userOptional.get();
            String userId = user.getId();

            // Lấy hoặc tạo giỏ hàng
            Optional<Cart> cartOptional = cartDAO.findByUserID(userId);
            Cart cart;
            if (cartOptional.isPresent()) {
                cart = cartOptional.get();
            } else {
                cart = new Cart(0, 30000, userId); // cartId sẽ được sinh tự động
                int generatedCartId = cartDAO.save(cart);
                cart.setCartId(generatedCartId);
            }

            // Đọc JSON từ request
            CartItemRequest itemRequest = objectMapper.readValue(request.getReader(), CartItemRequest.class);

            // Validate productId và quantity
            if (itemRequest.getProductId() == null || itemRequest.getProductId().isEmpty()) {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "Thiếu productId");
                return;
            }
            if (itemRequest.getQuantity() <= 0) {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "Quantity phải lớn hơn 0");
                return;
            }

            // Kiểm tra sản phẩm tồn tại
            int productIdInt;
            try {
                productIdInt = Integer.parseInt(itemRequest.getProductId());
            } catch (NumberFormatException e) {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "productId không hợp lệ");
                return;
            }

            Product product = productDAO.getProductById(productIdInt);
            if (product == null) {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "Sản phẩm không tồn tại");
                return;
            }

            // Kiểm tra tồn kho
            if (product.getStock() < itemRequest.getQuantity()) {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                    "Sản phẩm không đủ tồn kho");
                return;
            }

            // Kiểm tra sản phẩm trong giỏ hàng
            Optional<CartItem> existingItemOptional = cartDAO.findCartItemByProductId(cart.getCartId(), productIdInt);
            if (existingItemOptional.isPresent()) {
                // Sản phẩm đã có, tăng số lượng
                CartItem existingItem = existingItemOptional.get();
                int newQuantity = existingItem.getQuantity() + itemRequest.getQuantity();
                if (product.getStock() < newQuantity) {
                    sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                        "Sản phẩm không đủ tồn kho cho số lượng mới");
                    return;
                }
                existingItem.setQuantity(newQuantity);
                cartDAO.updateCartItem(existingItem);
            } else {
                // Tạo mới CartItem
                CartItem newItem = new CartItem(
                    productIdInt,
                    product.getName(),
                    product.getPrice(),
                    itemRequest.getQuantity(),
                    product.getImageUrl()
                );
                newItem.setCartId(cart.getCartId());
                cartDAO.addCartItem(newItem);
            }

            // Lấy lại giỏ hàng để trả về
            cart = cartDAO.findByUserID(userId).orElse(cart);

            // Trả về phản hồi thành công
            sendSuccessResponse(response, cart);

        } catch (IOException e) {
            sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
                "Dữ liệu JSON không hợp lệ: " + e.getMessage());
        } catch (Exception e) {
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Lỗi server: " + e.getMessage());
        }
    }

    // Lớp để ánh xạ JSON từ frontend
    private static class CartItemRequest {
        private String productId;
        private int quantity;

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    // Hàm gửi phản hồi thành công
    private void sendSuccessResponse(HttpServletResponse response, Cart cart) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        objectMapper.writeValue(response.getWriter(), cart);
    }


    // Lớp để trả về lỗi
    private static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }
}