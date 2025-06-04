package com.controller;

import com.dao.OrderDAO;
import com.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mapper.OrderMapper;
import com.model.Order;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet("/api/admin/orders/*")
public class AdminOrderServlet extends HttpServlet {

    private final OrderDAO orderDAO = new OrderDAO();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class OrderStatus {
        public static final String PROCESSING = "Đang xử lý";
        public static final String SUCCESS = "Thành công";
        public static final String CANCELLED = "Đã hủy";
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        resp.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
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

                sendJsonResponse(resp, ApiResponse.builder()
                        .success(true)
                        .message("Orders retrieved successfully")
                        .data(Map.of("orders", OrderMapper.toMapList(orders)))
                        .build(), HttpServletResponse.SC_OK);
                return;
            }

            sendErrorResponse(resp, "Đường dẫn không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(resp, "Lỗi server: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        resp.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
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
                sendErrorResponse(resp, "Order ID is required", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String[] pathParts = pathInfo.split("/");
            if (pathParts.length != 2) {
                sendErrorResponse(resp, "Invalid Order ID", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            int orderId;
            try {
                orderId = Integer.parseInt(pathParts[1]);
            } catch (NumberFormatException e) {
                sendErrorResponse(resp, "Invalid Order ID format", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            Order order = orderDAO.getOrderById(orderId);
            if (order == null) {
                sendErrorResponse(resp, "Order not found", HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            if ("Đang xử lý".equals(order.getStatus())) {
                sendErrorResponse(resp, "Không thể xóa đơn hàng. Chỉ đơn hàng 'Thành công' hoặc 'Đã hủy' mới được xóa.", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            boolean deleted = orderDAO.deleteOrder(orderId);
            if (deleted) {
                sendJsonResponse(resp, ApiResponse.builder()
                        .success(true)
                        .message("Order deleted successfully")
                        .data(Map.of("orderId", orderId))
                        .build());
            } else {
                sendErrorResponse(resp, "Order not found", HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            sendErrorResponse(resp, "Failed to delete order: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        resp.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
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