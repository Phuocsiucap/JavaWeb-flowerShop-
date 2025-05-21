package com.service;

import com.dto.request.OrderReviewRequest;
import com.model.OrderReview;

import java.util.List;
import java.util.Optional;

public interface OrderReviewService {
    List<OrderReview> getReviewsByOrderId(String orderId);
    Optional<OrderReview> getReviewById(String id);
    OrderReview createReview(String orderId, OrderReviewRequest reviewRequest);
    boolean likeReview(String reviewId);
    double getAverageRating(String orderId, String ratingField);
}
