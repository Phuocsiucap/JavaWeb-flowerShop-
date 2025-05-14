package com.controller;

import com.dao.OrderDAO;
import com.dao.OrderItemDAO;
import com.dao.UserDao;
import com.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mapper.OrderMapper;
import com.model.Order;
import com.model.OrderItem;
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
import java.util.Map;
import java.util.Optional;

/**
 * Servlet để lấy thông tin đơn hàng và các mục trong đơn hàng
 */
@WebServlet("/api/orders/*")
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
                sendErrorResponse(response, "Thiếu hoặc không hợp lệ token xác thực", HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            String token = authHeader.substring(7);

            // Lấy đường dẫn (path info) để xác định hành động
            String pathInfo = request.getPathInfo();
            if (pathInfo == null || "/".equals(pathInfo)) {
                // Trường hợp mặc định: lấy tất cả đơn hàng (getAllOrders)
                List<Order> orders = orderDAO.getAllOrders();
                if (orders.isEmpty()) {
                    sendErrorResponse(response, "Không tìm thấy đơn hàng nào", HttpServletResponse.SC_NOT_FOUND);
                    return;
                }
                System.out.println(OrderMapper.toMapList(orders)); // In ra để kiểm tra dữ liệu

                // Gửi danh sách tất cả đơn hàng về client với OrderMapper
                sendJsonResponse(response, ApiResponse.builder()
                        .success(true)
                        .message("Orders retrieved successfully")
                        .data(Map.of("orders", OrderMapper.toMapList(orders)))
                        .build());
            } else {
                String[] pathParts = pathInfo.substring(1).split("/"); // Loại bỏ dấu "/" và tách các phần
                if (pathParts.length == 1) {
                    // Xử lý lấy một đơn hàng cụ thể: /api/orders/{orderId}
                    int orderId;
                    try {
                        orderId = Integer.parseInt(pathParts[0]);
                    } catch (NumberFormatException e) {
                        sendErrorResponse(response, "Mã đơn hàng không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                        return;
                    }

                    // Lấy thông tin đơn hàng
                    Order order = orderDAO.getOrderById(orderId);
                    if (order == null) {
                        sendErrorResponse(response, "Không tìm thấy đơn hàng", HttpServletResponse.SC_NOT_FOUND);
                        return;
                    }

                    // Kiểm tra quyền truy cập
                    Optional<User> userOpt = authService.getUserFromToken(token);
                    if (!userOpt.isPresent()) {
                        sendErrorResponse(response, "Token không hợp lệ hoặc người dùng không tồn tại", HttpServletResponse.SC_UNAUTHORIZED);
                        return;
                    }
                    User user = userOpt.get();

                    if (!user.getId().equals(order.getUserId()) && !"admin".equals(user.getRole())) {
                        sendErrorResponse(response, "Bạn không có quyền truy cập đơn hàng này", HttpServletResponse.SC_FORBIDDEN);
                        return;
                    }

                    // Gửi dữ liệu JSON về client
                    sendJsonResponse(response, ApiResponse.builder()
                            .success(true)
                            .message("Order retrieved successfully")
                            .data(Map.of("order", OrderMapper.toMap(order)))
                            .build());
                } else if (pathParts.length == 2 && "items".equals(pathParts[0])) {
                    // Xử lý lấy các mục trong đơn hàng: /api/orders/items/{orderId}
                    int orderId;
                    try {
                        orderId = Integer.parseInt(pathParts[1]);
                    } catch (NumberFormatException e) {
                        sendErrorResponse(response, "Mã đơn hàng không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                        return;
                    }

                    // Lấy thông tin đơn hàng để kiểm tra tồn tại và quyền
                    Order order = orderDAO.getOrderById(orderId);
                    if (order == null) {
                        sendErrorResponse(response, "Không tìm thấy đơn hàng", HttpServletResponse.SC_NOT_FOUND);
                        return;
                    }

                    // Kiểm tra quyền truy cập
                    Optional<User> userOpt = authService.getUserFromToken(token);
                    if (!userOpt.isPresent()) {
                        sendErrorResponse(response, "Token không hợp lệ hoặc người dùng không tồn tại", HttpServletResponse.SC_UNAUTHORIZED);
                        return;
                    }
                    User user = userOpt.get();

                    if (!user.getId().equals(order.getUserId()) && !"admin".equals(user.getRole())) {
                        sendErrorResponse(response, "Bạn không có quyền truy cập đơn hàng này", HttpServletResponse.SC_FORBIDDEN);
                        return;
                    }

                    // Lấy danh sách OrderItem
                    List<OrderItem> orderItems = OrderItemDAO.getOrderItemsByOrderId(orderId);
                    if (orderItems.isEmpty()) {
                        sendErrorResponse(response, "Không tìm thấy mục nào trong đơn hàng", HttpServletResponse.SC_NOT_FOUND);
                        return;
                    }

                    // Gửi danh sách OrderItem về client (giả sử có OrderItemMapper)
                    sendJsonResponse(response, ApiResponse.builder()
                            .success(true)
                            .message("Order items retrieved successfully")
                            .data(Map.of("items", orderItems)) // Giả sử OrderItem có thể serialize trực tiếp
                            .build());
                } else {
                    sendErrorResponse(response, "Đường dẫn không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }
            }

        } catch (IOException e) {
            sendJsonResponse(response, "Lỗi server: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

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