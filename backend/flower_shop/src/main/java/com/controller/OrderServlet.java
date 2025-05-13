package com.controller;

import com.dao.OrderDAO;
import com.dao.UserDao;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.model.Order;
import com.model.User;
import com.service.AuthService;
import com.service.AuthServiceImpl;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Servlet để lấy thông tin đơn hàng
 */
@WebServlet("/api/orders")
public class OrderServlet extends HttpServlet {

    private final OrderDAO orderDAO = new OrderDAO();
    private final AuthService authService = new AuthServiceImpl(new UserDao());
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            // Xác thực người dùng qua token
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Thiếu hoặc không hợp lệ token xác thực");
                return;
            }

            String token = authHeader.substring(7);
            Optional<User> userOpt = authService.getUserFromToken(token);
            if (!userOpt.isPresent()) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token không hợp lệ hoặc người dùng không tồn tại");
                return;
            }

            User user = userOpt.get();

            // Lấy orderId từ query string (nếu có)
            String orderIdParam = request.getParameter("orderId");

            if (orderIdParam != null && !orderIdParam.isEmpty()) {
                // Trường hợp lấy một đơn hàng cụ thể
                int orderId;
                try {
                    orderId = Integer.parseInt(orderIdParam);
                } catch (NumberFormatException e) {
                    sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, "Mã đơn hàng không hợp lệ");
                    return;
                }

                // Lấy thông tin đơn hàng
                Order order = orderDAO.getOrderById(orderId);
                if (order == null) {
                    sendErrorResponse(response, HttpServletResponse.SC_NOT_FOUND, "Không tìm thấy đơn hàng");
                    return;
                }

                // Kiểm tra quyền truy cập
                if (!order.getUserId().equals(user.getId())) { // So sánh String
                    sendErrorResponse(response, HttpServletResponse.SC_FORBIDDEN, "Bạn không có quyền truy cập đơn hàng này");
                    return;
                }

                // Gửi dữ liệu JSON về client
                objectMapper.writeValue(response.getWriter(), order);
            } else {
                // Trường hợp lấy danh sách đơn hàng
                List<Order> orders = orderDAO.getOrdersByUserId(user.getId());
                if (orders.isEmpty()) {
                    sendErrorResponse(response, HttpServletResponse.SC_NOT_FOUND, "Không tìm thấy đơn hàng nào của người dùng này");
                    return;
                }

                // Gửi danh sách đơn hàng về client
                objectMapper.writeValue(response.getWriter(), orders);
            }

        } catch (IOException e) {
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Lỗi server: " + e.getMessage());
        }
    }

    // Hàm gửi phản hồi lỗi
    private void sendErrorResponse(HttpServletResponse response, int statusCode, String message) throws IOException {
        response.setStatus(statusCode);
        objectMapper.writeValue(response.getWriter(), new ErrorResponse(message));
    }

    // Lớp để trả về lỗi
    private static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }
}