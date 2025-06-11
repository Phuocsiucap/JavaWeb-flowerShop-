package com.controller;

import com.dao.OrderDAO;
import com.dao.OrderItemDAO;
import com.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mapper.OrderMapper;
import com.mapper.OrderItemMapper;
import com.model.Order;
import com.model.OrderItem;
import com.dto.request.UpdateOrderStatusRequest;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet("/api/customer/orders/*")
public class CustomerOrderServlet extends HttpServlet {

    private final OrderDAO orderDAO = new OrderDAO();
    private final OrderItemDAO orderItemDAO = new OrderItemDAO();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class OrderStatus {
        public static final String PENDING = "Pending";
        public static final String SHIPPING = "Shipping";
        public static final String SUCCESS = "Success";
        public static final String CANCELLED = "Cancelled";
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        resp.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            String userId = (String) req.getAttribute("userId");
            if (userId == null) {
                sendErrorResponse(resp, "Không tìm thấy thông tin người dùng từ token", HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            String pathInfo = req.getPathInfo();
            if (pathInfo == null || pathInfo.equals("/")) {
                // Get all orders for the user
                List<Order> userOrders = orderDAO.getOrdersByUserId(userId);
                if (userOrders.isEmpty()) {
                    sendErrorResponse(resp, "Không tìm thấy đơn hàng nào", HttpServletResponse.SC_NOT_FOUND);
                    return;
                }
                sendJsonResponse(resp, ApiResponse.builder()
                        .success(true)
                        .message("User orders retrieved successfully")
                        .data(Map.of("orders", OrderMapper.toMapList(userOrders)))
                        .build(), HttpServletResponse.SC_OK);
                return;
            }

            String[] pathParts = pathInfo.substring(1).split("/");
            if (pathParts.length == 1) {
                // Get specific order by orderId
                try {
                    int orderId = Integer.parseInt(pathParts[0]);
                    Order order = orderDAO.getOrderById(orderId);
                    if (order == null) {
                        sendErrorResponse(resp, "Không tìm thấy đơn hàng", HttpServletResponse.SC_NOT_FOUND);
                        return;
                    }
                    if (!userId.equals(order.getUserId())) {
                        sendErrorResponse(resp, "Bạn không có quyền truy cập đơn hàng này", HttpServletResponse.SC_FORBIDDEN);
                        return;
                    }
                    sendJsonResponse(resp, ApiResponse.builder()
                            .success(true)
                            .message("Order retrieved successfully")
                            .data(Map.of("order", OrderMapper.toMap(order)))
                            .build(), HttpServletResponse.SC_OK);
                } catch (NumberFormatException e) {
                    sendErrorResponse(resp, "Mã đơn hàng không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                }
            } else if (pathParts.length == 2 && "items".equals(pathParts[1])) {
                // Existing logic for order items
                try {
                    int orderId = Integer.parseInt(pathParts[0]);
                    Order order = orderDAO.getOrderById(orderId);
                    if (order == null) {
                        sendErrorResponse(resp, "Không tìm thấy đơn hàng", HttpServletResponse.SC_NOT_FOUND);
                        return;
                    }
                    if (!userId.equals(order.getUserId())) {
                        sendErrorResponse(resp, "Bạn không có quyền truy cập đơn hàng này", HttpServletResponse.SC_FORBIDDEN);
                        return;
                    }
                    List<OrderItem> orderItems = orderItemDAO.getOrderItemsByOrderId(orderId);
                    if (orderItems.isEmpty()) {
                        sendErrorResponse(resp, "Không tìm thấy mục nào trong đơn hàng", HttpServletResponse.SC_NOT_FOUND);
                        return;
                    }
                    sendJsonResponse(resp, ApiResponse.builder()
                            .success(true)
                            .message("Order items retrieved successfully")
                            .data(Map.of("items", OrderItemMapper.toMapList(orderItems)))
                            .build(), HttpServletResponse.SC_OK);
                } catch (NumberFormatException e) {
                    sendErrorResponse(resp, "Mã đơn hàng không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                }
            } else {
                sendErrorResponse(resp, "Đường dẫn không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(resp, "Lỗi server: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        resp.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            String userId = (String) req.getAttribute("userId");
            if (userId == null) {
                sendErrorResponse(resp, "Không tìm thấy thông tin người dùng từ token", HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            String pathInfo = req.getPathInfo();
            if (pathInfo == null || !pathInfo.startsWith("/update-status")) {
                sendErrorResponse(resp, "Endpoint không tồn tại", HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            UpdateOrderStatusRequest request = objectMapper.readValue(req.getInputStream(), UpdateOrderStatusRequest.class);
            int orderId = request.getOrderId();
            String newStatus = request.getStatus();

            Order order = orderDAO.getOrderById(orderId);
            if (order == null) {
                sendErrorResponse(resp, "Đơn hàng không tồn tại", HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            if (!userId.equals(order.getUserId())) {
                sendErrorResponse(resp, "Bạn không có quyền cập nhật đơn hàng này", HttpServletResponse.SC_FORBIDDEN);
                return;
            }

            String currentStatus = order.getStatus();
            if (currentStatus == null) {
                sendErrorResponse(resp, "Trạng thái hiện tại không xác định", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            // Kiểm tra trạng thái hiện tại và trạng thái mới có hợp lệ
            if (OrderStatus.SUCCESS.equals(currentStatus) || OrderStatus.CANCELLED.equals(currentStatus)) {
                sendErrorResponse(resp, "Không thể thay đổi trạng thái đơn hàng đã hoàn tất hoặc đã hủy", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            if (OrderStatus.PENDING.equals(currentStatus) && !OrderStatus.SHIPPING.equals(newStatus)) {
                sendErrorResponse(resp, "Đơn hàng ở trạng thái 'Đang xử lý' chỉ có thể chuyển sang 'Đang giao'", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            if (OrderStatus.SHIPPING.equals(currentStatus) && 
                !OrderStatus.SUCCESS.equals(newStatus) && !OrderStatus.CANCELLED.equals(newStatus)) {
                sendErrorResponse(resp, "Đơn hàng ở trạng thái 'Đang giao' chỉ có thể chuyển sang 'Thành công' hoặc 'Đã hủy'", HttpServletResponse.SC_BAD_REQUEST);
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
            sendErrorResponse(resp, "Lỗi server: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        resp.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        resp.setHeader("Access-Control-Max-Age", "86400");
        resp.setStatus(HttpServletResponse.SC_OK);
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