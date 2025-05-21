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
import java.util.stream.Collectors;

@WebServlet("/api/orders/*")
public class OrderServlet extends HttpServlet {

    private final OrderDAO orderDAO = new OrderDAO();
    private final OrderItemDAO orderItemDAO = new OrderItemDAO();
    private final AuthService authService = new AuthServiceImpl(new UserDao(), orderDAO);
    private final ObjectMapper objectMapper = new ObjectMapper();

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
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String authHeader = request.getHeader("Authorization");
            System.out.println("Authorization Header: " + authHeader);
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
            System.out.println("Authenticated user ID: " + user.getId());

            String pathInfo = request.getPathInfo();
            if (pathInfo == null || !pathInfo.matches("/\\d+")) {
                sendErrorResponse(response, "Order ID is required", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String[] pathParts = pathInfo.substring(1).split("/");
            int orderId;
            try {
                orderId = Integer.parseInt(pathParts[0]);
                System.out.println("Processing orderId: " + orderId);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Invalid Order ID format: " + e.getMessage(), HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            Order order = orderDAO.getOrderById(orderId);
            if (order == null) {
                System.out.println("Order not found for orderId: " + orderId);
                sendErrorResponse(response, "Order not found", HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            System.out.println("Order found, current status: " + order.getStatus());

            // Kiểm tra quyền truy cập
            if (!user.getId().equals(order.getUserId()) && !"admin".equals(user.getRole())) {
                System.out.println("Unauthorized access attempt by user: " + user.getId());
                sendErrorResponse(response, "Bạn không có quyền cập nhật trạng thái đơn hàng này", HttpServletResponse.SC_FORBIDDEN);
                return;
            }

            String newStatus = request.getParameter("status");
            if (newStatus == null || (!newStatus.equals("Success") && !newStatus.equals("Cancelled"))) {
                sendErrorResponse(response, "Trạng thái không hợp lệ. Chỉ chấp nhận 'Success' hoặc 'Cancelled'", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            // Kiểm tra trạng thái hợp lệ
            if ("Success".equals(newStatus) && !"Đang xử lý".equals(order.getStatus())) {
                System.out.println("Invalid status transition for orderId: " + orderId + ", current status: " + order.getStatus());
                sendErrorResponse(response, "Chỉ đơn hàng 'Đang xử lý' mới được thanh toán", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }
            if ("Cancelled".equals(newStatus) && !"Đang xử lý".equals(order.getStatus())) {
                System.out.println("Invalid status transition for orderId: " + orderId + ", current status: " + order.getStatus());
                sendErrorResponse(response, "Chỉ đơn hàng 'Đang xử lý' mới được hủy", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            // Gọi orderDAO.updateOrderStatus
            boolean updated = orderDAO.updateOrderStatus(orderId, newStatus);
            if (updated) {
                System.out.println("Order status updated successfully for orderId: " + orderId + " to " + newStatus);
                sendJsonResponse(response, ApiResponse.builder()
                        .success(true)
                        .message("Cập nhật trạng thái thành công")
                        .data(Map.of("orderId", orderId, "status", newStatus))
                        .build());
            } else {
                System.out.println("Failed to update order status for orderId: " + orderId);
                sendErrorResponse(response, "Cập nhật trạng thái thất bại", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            System.err.println("Server error details: " + e.getMessage());
            e.printStackTrace(); // In stack trace để debug
            sendErrorResponse(response, "Failed to update order status: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
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