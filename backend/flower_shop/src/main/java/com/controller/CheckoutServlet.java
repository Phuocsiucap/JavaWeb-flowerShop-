package com.controller;

import com.dao.OrderDAO;
import com.dao.ProductDAO;
import com.dao.ProductDAOImpl;
import com.dao.UserDao;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.model.Order;
import com.model.OrderItem;
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
    private final ProductDAO productDAO = new ProductDAOImpl();
    private final AuthService authService = new AuthServiceImpl(new UserDao());

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            // Xác thực token từ header
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Thiếu token");
                return;
            }

            String token = authHeader.substring(7);
            Optional<User> userOpt = authService.getUserFromToken(token);
            if (!userOpt.isPresent()) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token không hợp lệ");
                return;
            }

            User user = userOpt.get();
            CheckoutRequest checkout = objectMapper.readValue(request.getReader(), CheckoutRequest.class);

            if (checkout.items == null || checkout.items.isEmpty()) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Giỏ hàng trống");
                return;
            }

            double totalAmount = 0;
            for (OrderItem item : checkout.items) {
                totalAmount += item.getQuantity() * item.getPrice();
            }

            // Tạo đơn hàng
            Order order = new Order();
            order.setUserId(user.getId());
            order.setShippingAddress(checkout.shippingAddress);
            order.setPhoneNumber(checkout.phoneNumber);
            order.setPaymentMethod(checkout.paymentMethod);
            order.setTotalAmount(totalAmount);
            order.setStatus("Pending");
            order.setItems(checkout.items);

            // Giao dịch lưu đơn hàng
            int orderId = orderDAO.createOrderWithItems(order); // Đảm bảo DAO này dùng transaction
            if (orderId <= 0) {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Tạo đơn hàng thất bại");
                return;
            }

            // Trừ tồn kho từng sản phẩm
            for (OrderItem item : checkout.items) {
                boolean success = productDAO.decreaseStock(item.getProductId(), item.getQuantity());
                if (!success) {
                    orderDAO.deleteOrder(orderId); // rollback nếu thiếu kho
                    response.sendError(HttpServletResponse.SC_CONFLICT,
                            "Sản phẩm '" + item.getProductName() + "' không đủ hàng");
                    return;
                }
            }

            objectMapper.writeValue(response.getWriter(), new SuccessResponse("Đặt hàng thành công", orderId));

        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Lỗi: " + e.getMessage());
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
}
