package com.controller;

import com.dao.OrderDAO;
import com.dao.OrderItemDAO;
import com.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mapper.OrderMapper;
import com.model.Order;
import com.model.OrderItem;
import com.dto.request.UpdateOrderStatusRequest;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/admin/orders/*")
public class AdminOrderServlet extends HttpServlet {

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
        resp.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            String role = (String) req.getAttribute("role");
            if (!"admin".equals(role)) {
                sendErrorResponse(resp, "Chỉ admin mới có quyền truy cập", HttpServletResponse.SC_FORBIDDEN);
                return;
            }

            String pathInfo = req.getPathInfo();
            if (pathInfo == null || pathInfo.equals("/")) {
                // Get all orders
                List<Order> orders = orderDAO.getAllOrders();
                if (orders.isEmpty()) {
                    sendErrorResponse(resp, "Không tìm thấy đơn hàng nào", HttpServletResponse.SC_NOT_FOUND);
                    return;
                }

                Map<String, Object> data = new HashMap<>();
                data.put("orders", OrderMapper.toMapList(orders));
                sendJsonResponse(resp, ApiResponse.builder()
                        .success(true)
                        .message("Lấy danh sách đơn hàng thành công")
                        .data(data)
                        .build(), HttpServletResponse.SC_OK);
                return;
            }

            // Handle /<orderId>/items
            String[] pathParts = pathInfo.split("/");
            if (pathParts.length == 3 && "items".equals(pathParts[2])) {
                try {
                    int orderId = Integer.parseInt(pathParts[1]);
                    List<OrderItem> items = orderItemDAO.getOrderItemsByOrderId(orderId);
                    if (items.isEmpty()) {
//                        sendErrorResponse(resp, "Không tìm thấy mặt hàng nào cho đơn hàng " + orderId, HttpServletResponse.SC_NOT_FOUND);
                        return;
                    }

                    Map<String, Object> data = new HashMap<>();
                    data.put("items", items);
                    sendJsonResponse(resp, ApiResponse.builder()
                            .success(true)
                            .message("Lấy danh sách mặt hàng thành công")
                            .data(data)
                            .build(), HttpServletResponse.SC_OK);
                    return;
                } catch (NumberFormatException e) {
                    sendErrorResponse(resp, "Order ID không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }
            }

            sendErrorResponse(resp, "Đường dẫn không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(resp, "Lỗi server: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        resp.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            String role = (String) req.getAttribute("role");
            if (!"admin".equals(role)) {
                sendErrorResponse(resp, "Chỉ admin mới có quyền cập nhật trạng thái đơn hàng", HttpServletResponse.SC_FORBIDDEN);
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

            // Validate newStatus
            if (!List.of(OrderStatus.PENDING, OrderStatus.SHIPPING, OrderStatus.SUCCESS, OrderStatus.CANCELLED).contains(newStatus)) {
                sendErrorResponse(resp, "Trạng thái mới không hợp lệ: " + newStatus, HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            Order order = orderDAO.getOrderById(orderId);
            if (order == null) {
                sendErrorResponse(resp, "Đơn hàng không tồn tại", HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            String currentStatus = order.getStatus();
            if (currentStatus == null) {
                sendErrorResponse(resp, "Trạng thái hiện tại không xác định", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            // Cho phép chuyển trạng thái: Pending → Shipping, Shipping → Success/Cancelled
            if (OrderStatus.SUCCESS.equals(currentStatus) || OrderStatus.CANCELLED.equals(currentStatus)) {
                sendErrorResponse(resp, "Không thể thay đổi trạng thái đơn hàng đã hoàn tất hoặc đã hủy", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            if (OrderStatus.PENDING.equals(currentStatus) && !OrderStatus.SHIPPING.equals(newStatus)) {
                sendErrorResponse(resp, "Chỉ có thể chuyển từ 'Pending' sang 'Shipping'", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            if (OrderStatus.SHIPPING.equals(currentStatus) &&
                !(OrderStatus.SUCCESS.equals(newStatus) || OrderStatus.CANCELLED.equals(newStatus))) {
                sendErrorResponse(resp, "Chỉ có thể chuyển từ 'Shipping' sang 'Success' hoặc 'Cancelled'", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            boolean updated = orderDAO.updateOrderStatus(orderId, newStatus);
            if (updated) {
                Map<String, Object> data = new HashMap<>();
                data.put("orderId", orderId);
                data.put("status", newStatus);
                sendJsonResponse(resp, ApiResponse.builder()
                        .success(true)
                        .message("Cập nhật trạng thái thành công")
                        .data(data)
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
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        resp.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            String role = (String) req.getAttribute("role");
            if (!"admin".equals(role)) {
                sendErrorResponse(resp, "Chỉ admin mới có quyền xóa đơn hàng", HttpServletResponse.SC_FORBIDDEN);
                return;
            }

            String pathInfo = req.getPathInfo();
            if (pathInfo == null || pathInfo.equals("/")) {
                sendErrorResponse(resp, "Yêu cầu Order ID", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String[] pathParts = pathInfo.split("/");
            if (pathParts.length != 2) {
                sendErrorResponse(resp, "Order ID không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            int orderId;
            try {
                orderId = Integer.parseInt(pathParts[1]);
            } catch (NumberFormatException e) {
                sendErrorResponse(resp, "Định dạng Order ID không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            Order order = orderDAO.getOrderById(orderId);
            if (order == null) {
                sendErrorResponse(resp, "Không tìm thấy đơn hàng", HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            if (OrderStatus.PENDING.equals(order.getStatus()) || OrderStatus.SHIPPING.equals(order.getStatus())) {
                sendErrorResponse(resp, "Không thể xóa đơn hàng. Chỉ đơn hàng 'Success' hoặc 'Cancelled' mới được xóa.", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            boolean deleted = orderDAO.deleteOrder(orderId);
            if (deleted) {
                Map<String, Object> data = new HashMap<>();
                data.put("orderId", orderId);
                sendJsonResponse(resp, ApiResponse.builder()
                        .success(true)
                        .message("Xóa đơn hàng thành công")
                        .data(data)
                        .build());
            } else {
                sendErrorResponse(resp, "Không tìm thấy đơn hàng", HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(resp, "Lỗi khi xóa đơn hàng: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        resp.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        resp.setHeader("Access-Control-Max-Age", "86400");
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    private void sendJsonResponse(HttpServletResponse response, ApiResponse data) throws IOException {
        sendJsonResponse(response, data, HttpServletResponse.SC_OK);
    }

    private void sendJsonResponse(HttpServletResponse response, ApiResponse data, int status) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(status);
        objectMapper.writeValue(response.getOutputStream(), data);
    }

    private void sendErrorResponse(HttpServletResponse response, String message, int status) throws IOException {
        Map<String, Object> data = new HashMap<>(); // Đảm bảo data không null
        ApiResponse errorResponse = ApiResponse.builder()
                .success(false)
                .message(message)
                .data(data)
                .build();
        sendJsonResponse(response, errorResponse, status);
    }
}