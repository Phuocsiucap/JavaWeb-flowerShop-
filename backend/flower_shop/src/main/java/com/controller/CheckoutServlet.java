package com.controller;

import com.dao.OrderDAO;
import com.dao.UserDao;
import com.model.Order;
import com.model.OrderItem;
import com.model.User;
import com.service.AuthService;
import com.service.AuthServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@WebServlet("/api/checkout")
public class CheckoutServlet extends HttpServlet {

    private static final AuthService authService = new AuthServiceImpl(new UserDao());
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final OrderDAO orderDAO = new OrderDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            // Xác thực token
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Thiếu hoặc sai token");
                return;
            }

            String token = authHeader.substring(7);
            Optional<User> userOptional = authService.getUserFromToken(token);
            if (!userOptional.isPresent()) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token không hợp lệ");
                return;
            }

            User user = userOptional.get();
            String userId = user.getId();

            // Đọc JSON từ frontend
            CheckoutRequest checkoutRequest = objectMapper.readValue(request.getReader(), CheckoutRequest.class);

            // Kiểm tra dữ liệu
            if (checkoutRequest.shippingAddress == null || checkoutRequest.shippingAddress.trim().isEmpty()
                || checkoutRequest.phoneNumber == null || checkoutRequest.phoneNumber.trim().isEmpty()
                || checkoutRequest.paymentMethod == null || checkoutRequest.paymentMethod.trim().isEmpty()
                || checkoutRequest.items == null || checkoutRequest.items.isEmpty()) {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, "Thiếu thông tin thanh toán hoặc giỏ hàng");
                return;
            }

            // Tính tổng tiền
            double totalAmount = 0;
            for (OrderItem item : checkoutRequest.items) {
                totalAmount += item.getSubtotal();
            }

            // Tạo đơn hàng
            Order order = new Order();
            order.setUserId(userId);
            order.setTotalAmount(totalAmount);
            order.setStatus("Pending");
            order.setPaymentMethod(checkoutRequest.paymentMethod);
            order.setShippingAddress(checkoutRequest.shippingAddress);
            order.setPhoneNumber(checkoutRequest.phoneNumber);
            order.setItems(checkoutRequest.items);

            int orderId = orderDAO.createOrder(order);

            if (orderId > 0) {
                sendSuccessResponse(response, orderId);
            } else {
                sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Tạo đơn hàng thất bại");
            }

        } catch (IOException e) {
            sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, "Lỗi JSON: " + e.getMessage());
        } catch (Exception e) {
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Lỗi máy chủ: " + e.getMessage());
        }
    }

    private static class CheckoutRequest {
        public String shippingAddress;
        public String phoneNumber;
        public String paymentMethod;
        public List<OrderItem> items;
    }

    private static class SuccessResponse {
        public String message;
        public int orderId;

        public SuccessResponse(String message, int orderId) {
            this.message = message;
            this.orderId = orderId;
        }
    }

    private void sendSuccessResponse(HttpServletResponse response, int orderId) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        objectMapper.writeValue(response.getWriter(), new SuccessResponse("Đặt hàng thành công", orderId));
    }

    private static class ErrorResponse {
        public String message;

        public ErrorResponse(String message) {
            this.message = message;
        }
    }

    private void sendErrorResponse(HttpServletResponse response, int statusCode, String message) throws IOException {
        response.setStatus(statusCode);
        objectMapper.writeValue(response.getWriter(), new ErrorResponse(message));
    }
}
