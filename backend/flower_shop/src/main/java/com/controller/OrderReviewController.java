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

@WebServlet("/api/ordersreveiw/*")
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
        String pathInfo = req.getPathInfo();
        String[] pathParts = pathInfo.split("/");
        
        // Path format should be /orderId/reviews or /orderId/reviews/reviewId
        if (pathParts.length < 3) {
            sendErrorResponse(resp, "Invalid URL path", HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        
        String orderId = pathParts[1];
        
        if (pathParts.length == 3 || (pathParts.length == 4 && pathParts[3].isEmpty())) {
            // Get all reviews for an order
            List<OrderReview> reviews = orderReviewService.getReviewsByOrderId(orderId);
            
            sendJsonResponse(resp, ApiResponse.builder()
                    .success(true)
                    .message("Reviews retrieved successfully")
                    .data(Map.of("reviews", OrderReviewMapper.toMapList(reviews)))
                    .build());
        } else if (pathParts.length == 4) {
            // Get specific review by ID
            String reviewId = pathParts[3];
            Optional<OrderReview> review = orderReviewService.getReviewById(reviewId);
            
            if (review.isPresent()) {
                sendJsonResponse(resp, ApiResponse.builder()
                        .success(true)
                        .message("Review retrieved successfully")
                        .data(Map.of("review", OrderReviewMapper.toMap(review.get())))
                        .build());
            } else {
                sendErrorResponse(resp, "Review not found", HttpServletResponse.SC_NOT_FOUND);
            }
        } else {
            sendErrorResponse(resp, "Invalid URL path", HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    	System.out.println(resp);
        String pathInfo = req.getPathInfo();
        String[] pathParts = pathInfo.split("/");
        
        // Path format should be /orderId/reviews or /orderId/reviews/reviewId/like
        if (pathParts.length < 3) {
            sendErrorResponse(resp, "Invalid URL path", HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        
        String orderId = pathParts[1];
        int orderid = Integer.parseInt(pathParts[1]);
        Order order = orderDao.getOrderById((orderid));
        
        String userId = (String) req.getAttribute("userId");
        if(!userId.equals(order.getUserId())) {
        	sendErrorResponse(resp, "you don't have permistion", HttpServletResponse.SC_UNAUTHORIZED);
        }
        
        if (pathParts.length == 3 || (pathParts.length == 4 && pathParts[3].isEmpty())) {
            // Create a new review for an order
            
            try {
                OrderReviewRequest reviewRequest = objectMapper.readValue(req.getInputStream(), OrderReviewRequest.class);
                OrderReview createdReview = orderReviewService.createReview(orderId, reviewRequest);
                
                if (createdReview != null) {
                    sendJsonResponse(resp, ApiResponse.builder()
                            .success(true)
                            .message("Review created successfully")
                            .data(Map.of("review", OrderReviewMapper.toMap(createdReview)))
                            .build(), HttpServletResponse.SC_CREATED);
                } else {
                    sendErrorResponse(resp, "Failed to create review", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }
            } catch (Exception e) {
                sendErrorResponse(resp, "Invalid request format: " + e.getMessage(), HttpServletResponse.SC_BAD_REQUEST);
            }
        } else if (pathParts.length == 5 && "like".equals(pathParts[4])) {
            // Like a review
            String reviewId = pathParts[3];
            boolean success = orderReviewService.likeReview(reviewId);
            
            if (success) {
                Optional<OrderReview> updatedReview = orderReviewService.getReviewById(reviewId);
                if (updatedReview.isPresent()) {
                    sendJsonResponse(resp, ApiResponse.builder()
                            .success(true)
                            .message("Review liked successfully")
                            .data(Map.of("review", OrderReviewMapper.toMap(updatedReview.get())))
                            .build());
                } else {
                    sendJsonResponse(resp, ApiResponse.builder()
                            .success(true)
                            .message("Review liked successfully")
                            .build());
                }
            } else {
                sendErrorResponse(resp, "Failed to like review", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        } else {
            sendErrorResponse(resp, "Invalid URL path", HttpServletResponse.SC_BAD_REQUEST);
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