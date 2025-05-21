package com.controller;

import com.dao.OrderDAO;
import com.dao.OrderItemDAO;
import com.dao.UserDao;
import com.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mapper.OrderMapper;
import com.mapper.OrderItemMapper;
import com.model.Order;
import com.model.OrderItem;
import com.dto.request.UpdateOrderStatusRequest;
import com.model.User;
import com.service.AuthService;
import com.service.AuthServiceImpl;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@WebServlet("/api/orders/*")
public class OrderServlet extends HttpServlet {

    private final OrderDAO orderDAO = new OrderDAO();
    private final OrderItemDAO orderItemDAO = new OrderItemDAO();
    private final AuthService authService = new AuthServiceImpl(new UserDao(), orderDAO);
    private final ObjectMapper objectMapper = new ObjectMapper();
    public static class OrderStatus {
        public static final String PROCESSING = "Đang xử lý";
        public static final String SUCCESS = "Thành công";
        public static final String CANCELLED = "Đã hủy";
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendErrorResponse(response, "Thiếu hoặc không hợp lệ token xác thực", HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            String token = authHeader.substring(7);
            Optional<User> userOpt = authService.getUserFromToken(token);
            if (!userOpt.isPresent()) {
                sendErrorResponse(response, "Token không hợp lệ hoặc người dùng không tồn tại", HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
            User user = userOpt.get();

            String pathInfo = request.getPathInfo();
            if (pathInfo == null || "/".equals(pathInfo)) {
                if (!"admin".equals(user.getRole())) {
                    sendErrorResponse(response, "Chỉ admin mới có quyền truy cập danh sách tất cả đơn hàng", HttpServletResponse.SC_FORBIDDEN);
                    return;
                }

                List<Order> orders = orderDAO.getAllOrders();
                if (orders.isEmpty()) {
                    sendErrorResponse(response, "Không tìm thấy đơn hàng nào", HttpServletResponse.SC_NOT_FOUND);
                    return;
                }

                sendJsonResponse(response, ApiResponse.builder()
                        .success(true)
                        .message("Orders retrieved successfully")
                        .data(Map.of("orders", OrderMapper.toMapList(orders)))
                        .build());
            } else {
                String[] pathParts = pathInfo.substring(1).split("/");
                if (pathParts.length >= 1) {
                    if (pathParts[0].equals("user")) {
                        String userId = user.getId();
                        if (pathParts.length == 2) {
                            if (!userId.equals(pathParts[1])) {
                                sendErrorResponse(response, "Bạn chỉ có thể xem đơn hàng của chính mình", HttpServletResponse.SC_FORBIDDEN);
                                return;
                            }
                        }

                        List<Order> userOrders = orderDAO.getOrdersByUserId(userId);
                        if (userOrders.isEmpty()) {
                            sendErrorResponse(response, "Không tìm thấy đơn hàng nào cho người dùng này", HttpServletResponse.SC_NOT_FOUND);
                            return;
                        }

                        sendJsonResponse(response, ApiResponse.builder()
                                .success(true)
                                .message("User orders retrieved successfully")
                                .data(Map.of("orders", OrderMapper.toMapList(userOrders)))
                                .build());
                    } else if (pathParts.length == 1) {
                        int orderId;
                        try {
                            orderId = Integer.parseInt(pathParts[0]);
                        } catch (NumberFormatException e) {
                            sendErrorResponse(response, "Mã đơn hàng không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                            return;
                        }

                        Order order = orderDAO.getOrderById(orderId);
                        if (order == null) {
                            sendErrorResponse(response, "Không tìm thấy đơn hàng", HttpServletResponse.SC_NOT_FOUND);
                            return;
                        }

                        if (!user.getId().equals(order.getUserId()) && !"admin".equals(user.getRole())) {
                            sendErrorResponse(response, "Bạn không có quyền truy cập đơn hàng này", HttpServletResponse.SC_FORBIDDEN);
                            return;
                        }

                        sendJsonResponse(response, ApiResponse.builder()
                                .success(true)
                                .message("Order retrieved successfully")
                                .data(Map.of("order", OrderMapper.toMap(order)))
                                .build());
                    } else if (pathParts.length == 2 && "items".equals(pathParts[1])) {
                        int orderId;
                        try {
                            orderId = Integer.parseInt(pathParts[0]);
                        } catch (NumberFormatException e) {
                            sendErrorResponse(response, "Mã đơn hàng không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                            return;
                        }

                        Order order = orderDAO.getOrderById(orderId);
                        if (order == null) {
                            sendErrorResponse(response, "Không tìm thấy đơn hàng", HttpServletResponse.SC_NOT_FOUND);
                            return;
                        }

                        if (!user.getId().equals(order.getUserId()) && !"admin".equals(user.getRole())) {
                            sendErrorResponse(response, "Bạn không có quyền truy cập đơn hàng này", HttpServletResponse.SC_FORBIDDEN);
                            return;
                        }

                        List<OrderItem> orderItems = orderItemDAO.getOrderItemsByOrderId(orderId);
                        if (orderItems.isEmpty()) {
                            sendErrorResponse(response, "Không tìm thấy mục nào trong đơn hàng", HttpServletResponse.SC_NOT_FOUND);
                            return;
                        }

                        sendJsonResponse(response, ApiResponse.builder()
                                .success(true)
                                .message("Order items retrieved successfully")
                                .data(Map.of("items", OrderItemMapper.toMapList(orderItems)))
                                .build());
                    } else {
                        sendErrorResponse(response, "Đường dẫn không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                    }
                } else {
                    sendErrorResponse(response, "Đường dẫn không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                }
            }
        } catch (Exception e) {
            sendErrorResponse(response, "Lỗi server: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo != null && pathInfo.startsWith("/update-status")) {
            try {
                // Lấy userId từ request (đã được JwtAuthFilter set vào)
                String userId = (String) req.getAttribute("userId");
                String role = (String) req.getAttribute("role");

                if (userId == null) {
                    sendErrorResponse(resp, "Không tìm thấy thông tin người dùng từ token", HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }

                // Đọc JSON body
                UpdateOrderStatusRequest request = objectMapper.readValue(req.getInputStream(), UpdateOrderStatusRequest.class);
                int orderId = request.getOrderId();
                String newStatus = request.getStatus();

                Order order = orderDAO.getOrderById(orderId);
                if (order == null) {
                    sendErrorResponse(resp, "Order không tồn tại", HttpServletResponse.SC_NOT_FOUND);
                    return;
                }

                // Kiểm tra quyền
                if (!userId.equals(order.getUserId()) && !"admin".equals(role)) {
                    sendErrorResponse(resp, "Bạn không có quyền cập nhật đơn hàng này", HttpServletResponse.SC_FORBIDDEN);
                    return;
                }

                String currentStatus = order.getStatus();
                if (currentStatus == null) {
                    sendErrorResponse(resp, "Trạng thái hiện tại không xác định", HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }

                if ("Success".equals(newStatus)) {
                    if (!"Pending".equals(currentStatus)) {
                        sendErrorResponse(resp, "Chỉ có thể chuyển sang Success nếu trạng thái hiện tại là Pending", HttpServletResponse.SC_BAD_REQUEST);
                        return;
                    }
                } else if ("Cancelled".equals(newStatus)) {
                    if (!"Pending".equals(currentStatus)) {
                        sendErrorResponse(resp, "Chỉ có thể hủy đơn khi trạng thái hiện tại là Pending", HttpServletResponse.SC_BAD_REQUEST);
                        return;
                    }
                } else {
                    // Không cho phép cập nhật về Pending hoặc trạng thái khác
                    sendErrorResponse(resp, "Trạng thái mới không hợp lệ: " + newStatus, HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }

                boolean updated = orderDAO.updateOrderStatus(orderId, newStatus);
                if (updated) {
                    sendJsonResponse(resp, ApiResponse.builder()
                            .success(true)
                            .message("Cập nhật trạng thái thành công")
                            .data(Map.of("orderId", orderId, "status", newStatus))
                            .build(), HttpServletResponse.SC_OK);
                } else {
                    sendErrorResponse(resp, "Cập nhật trạng thái thất bại", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }

            } catch (Exception e) {
                e.printStackTrace();
                sendErrorResponse(resp, "Lỗi xử lý yêu cầu: " + e.getMessage(), HttpServletResponse.SC_BAD_REQUEST);
            }
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            resp.getWriter().write("Endpoint không tồn tại");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendErrorResponse(response, "Thiếu hoặc không hợp lệ token xác thực", HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            String token = authHeader.substring(7);
            Optional<User> userOpt = authService.getUserFromToken(token);
            if (!userOpt.isPresent()) {
                sendErrorResponse(response, "Token không hợp lệ hoặc người dùng không tồn tại", HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
            User user = userOpt.get();

            String pathInfo = request.getPathInfo();
            if (pathInfo == null || pathInfo.equals("/")) {
                sendErrorResponse(response, "Order ID is required", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String[] pathParts = pathInfo.split("/");
            if (pathParts.length != 2) {
                sendErrorResponse(response, "Invalid Order ID", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            int orderId;
            try {
                orderId = Integer.parseInt(pathParts[1]);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Invalid Order ID format", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            Order order = orderDAO.getOrderById(orderId);
            if (order == null) {
                sendErrorResponse(response, "Order not found", HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            if (!user.getId().equals(order.getUserId()) && !"admin".equals(user.getRole())) {
                sendErrorResponse(response, "Bạn không có quyền xóa đơn hàng này", HttpServletResponse.SC_FORBIDDEN);
                return;
            }
            if ("Đang xử lý".equals(order.getStatus())) {
                sendErrorResponse(response, "Không thể xóa đơn hàng. Chỉ đơn hàng 'Thành công' hoặc 'Đã hủy' mới được xóa.", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            boolean deleted = orderDAO.deleteOrder(orderId);
            if (deleted) {
                sendJsonResponse(response, ApiResponse.builder()
                        .success(true)
                        .message("Order deleted successfully")
                        .data(Map.of("orderId", orderId))
                        .build());
            } else {
                sendErrorResponse(response, "Order not found", HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            sendErrorResponse(response, "Failed to delete order: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        response.setHeader("Access-Control-Max-Age", "86400");
        response.setStatus(HttpServletResponse.SC_OK);
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

    private void sendErrorResponse(HttpServletResponse response, String message, int status) throws IOException {
        ApiResponse errorResponse = ApiResponse.builder()
                .success(false)
                .message(message)
                .build();
        sendJsonResponse(response, errorResponse, status);
    }
}