package com.controller;

import com.dao.OrderDAO;
import com.dao.OrderItemDAO;
import com.dao.ProductDAO;
import com.dao.ProductDAOImpl;
import com.dao.UserDao;
import com.dto.request.CheckoutRequest;
import com.dto.response.SuccessResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.dto.response.ApiResponse;
import com.model.Order;
import com.model.OrderItem;
import com.model.Product;
import com.model.User;
import com.service.AuthService;
import com.service.AuthServiceImpl;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@WebServlet("/api/checkout")
public class CheckoutServlet extends HttpServlet {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final OrderDAO orderDAO = new OrderDAO();
    private final OrderItemDAO orderItemDAO = new OrderItemDAO();
    private final ProductDAO productDAO = new ProductDAOImpl();
    private final AuthService authService = new AuthServiceImpl(new UserDao(), null);

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        try {
            // Xác thực token từ header
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendErrorResponse(response, "Thiếu token", HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            String token = authHeader.substring(7);
            Optional<User> userOpt = authService.getUserFromToken(token);
            if (!userOpt.isPresent()) {
                sendErrorResponse(response, "Token không hợp lệ", HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            User user = userOpt.get();

            CheckoutRequest checkout = objectMapper.readValue(request.getReader(), CheckoutRequest.class);
            if (checkout.items == null || checkout.items.isEmpty()) {
                sendErrorResponse(response, "Giỏ hàng trống", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            double totalAmount = 0;
            // Bổ sung thông tin productName và imageUrl cho từng OrderItem
            for (OrderItem item : checkout.items) {
                Product product = productDAO.getProductById(item.getProductId());
                if (product == null) {
                    sendErrorResponse(response,
                            "Sản phẩm với ID " + item.getProductId() + " không tồn tại",
                            HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }
                item.setProductName(product.getName());
                item.setImageUrl(product.getImageUrl());
                item.setPrice(product.getPrice()); // Đảm bảo giá lấy từ DB để tránh sai lệch
                totalAmount += item.getQuantity() * item.getPrice();
            }

            // Tạo đơn hàng
            Order order = new Order();
            order.setUserId(user.getId());
            order.setShippingAddress(checkout.shippingAddress);
            order.setPhoneNumber(checkout.phoneNumber);
            order.setPaymentMethod(checkout.paymentMethod);
            order.setTotalAmount(totalAmount);

            // Lưu đơn hàng
            int orderId = orderDAO.createOrder(order);
            if (orderId <= 0) {
                sendErrorResponse(response, "Tạo đơn hàng thất bại", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return;
            }

            // Lưu các mặt hàng
            boolean itemsSaved = orderItemDAO.createOrderItems(orderId, checkout.items);
            if (!itemsSaved) {
                orderDAO.deleteOrder(orderId); // Rollback nếu lưu mặt hàng thất bại
                sendErrorResponse(response, "Lưu mặt hàng thất bại", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return;
            }

            // Trừ tồn kho từng sản phẩm
            for (OrderItem item : checkout.items) {
                boolean success = productDAO.decreaseStock(item.getProductId(), item.getQuantity());
                if (!success) {
                    orderDAO.deleteOrder(orderId); // Rollback nếu trừ kho thất bại
                    sendErrorResponse(response,
                            "Sản phẩm '" + item.getProductName() + "' không đủ hàng",
                            HttpServletResponse.SC_CONFLICT);
                    return;
                }
            }

            sendJsonResponse(response, new SuccessResponse("Đặt hàng thành công", orderId));

        } catch (Exception e) {
            sendErrorResponse(response, "Lỗi: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    // Helper method to send success JSON response
    private void sendJsonResponse(HttpServletResponse response, Object data) throws IOException {
        sendJsonResponse(response, data, HttpServletResponse.SC_OK);
    }

    private void sendJsonResponse(HttpServletResponse response, Object data, int status) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(status);
        objectMapper.writeValue(response.getOutputStream(), data);
    }

    // Helper method to send standardized error response
    private void sendErrorResponse(HttpServletResponse response, String message, int status) throws IOException {
        ApiResponse errorResponse = ApiResponse.builder()
                .success(false)
                .message(message)
                .build();
        sendJsonResponse(response, errorResponse, status);
    }
}