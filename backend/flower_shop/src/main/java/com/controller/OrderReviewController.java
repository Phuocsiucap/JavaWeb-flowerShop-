package com.controller;

import com.dao.OrderReviewDao;
import com.dao.OrderDAO;
import com.model.*;
import com.dto.request.OrderReviewRequest;
import com.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mapper.OrderReviewMapper;
import com.model.OrderReview;
import com.model.User;
import com.service.OrderReviewService;
import com.service.OrderReviewServiceImpl;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@WebServlet("/api/ordersreview/*")
public class OrderReviewController extends HttpServlet {
    private final OrderReviewService orderReviewService;
    private final ObjectMapper objectMapper;
    private final OrderDAO orderDao = new OrderDAO();

    public OrderReviewController() {
        OrderReviewDao orderReviewDao = new OrderReviewDao();
        
        this.orderReviewService = new OrderReviewServiceImpl(orderReviewDao);
        this.objectMapper = new ObjectMapper();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Thiết lập các header CORS
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            String pathInfo = req.getPathInfo();
            if (pathInfo == null || pathInfo.equals("/")) {
                sendErrorResponse(resp, "Đường dẫn không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String[] pathParts = pathInfo.substring(1).split("/");

            // Trường hợp lấy tất cả đánh giá
            if (pathParts.length == 1 && "all".equals(pathParts[0])) {
                String userId = (String) req.getAttribute("userId");
                if (userId == null) {
                    sendErrorResponse(resp, "Không tìm thấy thông tin người dùng từ token", HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
                List<OrderReview> allReviews = orderReviewService.getAllReviews();
                sendJsonResponse(resp, ApiResponse.builder()
                        .success(true)
                        .message("All reviews retrieved successfully")
                        .data(Map.of("reviews", OrderReviewMapper.toMapList(allReviews)))
                        .build());
                return;
            }

            // Trường hợp lấy review của 1 đơn hàng theo orderId
            // URL: /{orderId}
            if (pathParts.length == 1) {
                String userId = (String) req.getAttribute("userId");
                if (userId == null) {
                    sendErrorResponse(resp, "Không tìm thấy thông tin người dùng từ token", HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
                try {
                    int orderId = Integer.parseInt(pathParts[0]);
                    Order order = orderDao.getOrderById(orderId);
                    if (order == null) {
                        sendErrorResponse(resp, "Không tìm thấy đơn hàng", HttpServletResponse.SC_NOT_FOUND);
                        return;
                    }
                    if (!userId.equals(order.getUserId())) {
                        sendErrorResponse(resp, "Bạn không có quyền truy cập đánh giá của đơn hàng này", HttpServletResponse.SC_FORBIDDEN);
                        return;
                    }
                    Optional<OrderReview> reviewOpt = orderReviewService.getReviewById(String.valueOf(orderId));
                    if (reviewOpt.isPresent()) {
                        sendJsonResponse(resp, ApiResponse.builder()
                                .success(true)
                                .message("Review retrieved successfully")
                                .data(Map.of("review", OrderReviewMapper.toMap(reviewOpt.get())))
                                .build());
                    } else {
                        sendErrorResponse(resp, "Không tìm thấy đánh giá cho đơn hàng: " + orderId, HttpServletResponse.SC_NOT_FOUND);
                    }
                } catch (NumberFormatException e) {
                    sendErrorResponse(resp, "Mã đơn hàng không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                }
                return;
            }

            // Trường hợp lấy tất cả review theo productId
            // URL: /product/{productId}
            if (pathParts.length == 2 && "product".equals(pathParts[0])) {
                String productId = pathParts[1];
                List<OrderReview> reviews = orderReviewService.getReviewsByProductId(productId);
                sendJsonResponse(resp, ApiResponse.builder()
                        .success(true)
                        .message("Reviews retrieved successfully")
                        .data(Map.of("reviews", OrderReviewMapper.toMapList(reviews)))
                        .build());
                return;
            }

            sendErrorResponse(resp, "Đường dẫn không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(resp, "Lỗi server: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Thiết lập header CORS
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            String pathInfo = req.getPathInfo();
            if (pathInfo == null || pathInfo.equals("/")) {
                sendErrorResponse(resp, "Đường dẫn không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String[] pathParts = pathInfo.substring(1).split("/");
            // Path format should be /orderId/reviews or /orderId/reviews/reviewId/like
            if (pathParts.length < 2) {
                sendErrorResponse(resp, "Đường dẫn không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            // Kiểm tra userId từ token
            String userId = (String) req.getAttribute("userId");
            if (userId == null) {
                sendErrorResponse(resp, "Không tìm thấy thông tin người dùng từ token", HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            // Chuyển đổi orderId và lấy đơn hàng
            int orderId;
            try {
                orderId = Integer.parseInt(pathParts[0]);
            } catch (NumberFormatException e) {
                sendErrorResponse(resp, "Mã đơn hàng không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            Order order = orderDao.getOrderById(orderId);
            if (order == null) {
                sendErrorResponse(resp, "Không tìm thấy đơn hàng", HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            // Kiểm tra quyền sở hữu đơn hàng
            if (!userId.equals(order.getUserId())) {
                sendErrorResponse(resp, "Bạn không có quyền thực hiện hành động này", HttpServletResponse.SC_FORBIDDEN);
                return;
            }

            // Trường hợp tạo đánh giá mới: /orderId/reviews
            if (pathParts.length == 2 || (pathParts.length == 3 && pathParts[2].isEmpty())) {
                // Kiểm tra trạng thái đơn hàng
                if (!CustomerOrderServlet.OrderStatus.SUCCESS.equals(order.getStatus())) {
                    sendErrorResponse(resp, "Chỉ các đơn hàng đã hoàn tất mới có thể được đánh giá", HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }

                try {
                    OrderReviewRequest reviewRequest = objectMapper.readValue(req.getInputStream(), OrderReviewRequest.class);
                    OrderReview createdReview = orderReviewService.createReview(String.valueOf(orderId), reviewRequest);
                    if (createdReview != null) {
                        sendJsonResponse(resp, ApiResponse.builder()
                                .success(true)
                                .message("Đánh giá được tạo thành công")
                                .data(Map.of("review", OrderReviewMapper.toMap(createdReview)))
                                .build(), HttpServletResponse.SC_CREATED);
                    } else {
                        sendErrorResponse(resp, "Không thể tạo đánh giá", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    }
                } catch (Exception e) {
                    sendErrorResponse(resp, "Định dạng yêu cầu không hợp lệ: " + e.getMessage(), HttpServletResponse.SC_BAD_REQUEST);
                }
            }
            // Trường hợp thích một đánh giá: /orderId/reviews/reviewId/like
            else if (pathParts.length == 4 && "like".equals(pathParts[3])) {
                String reviewId = pathParts[2];
                boolean success = orderReviewService.likeReview(reviewId);
                if (success) {
                    Optional<OrderReview> updatedReview = orderReviewService.getReviewById(reviewId);
                    if (updatedReview.isPresent()) {
                        sendJsonResponse(resp, ApiResponse.builder()
                                .success(true)
                                .message("Thích đánh giá thành công")
                                .data(Map.of("review", OrderReviewMapper.toMap(updatedReview.get())))
                                .build());
                    } else {
                        sendJsonResponse(resp, ApiResponse.builder()
                                .success(true)
                                .message("Thích đánh giá thành công")
                                .build());
                    }
                } else {
                    sendErrorResponse(resp, "Không thể thích đánh giá", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }
            } else {
                sendErrorResponse(resp, "Đường dẫn không hợp lệ", HttpServletResponse.SC_BAD_REQUEST);
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(resp, "Lỗi server: " + e.getMessage(), HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
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

    private void sendErrorResponse(HttpServletResponse response, String message, int status) throws IOException {
        response.setStatus(status);
        ApiResponse errorResponse = ApiResponse.builder()
                .success(false)
                .message(message)
                .build();
        sendJsonResponse(response, errorResponse, status);
    }
}