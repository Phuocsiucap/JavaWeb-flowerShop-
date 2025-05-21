
package com.service;

import com.dao.OrderReviewDao;
import com.dto.request.OrderReviewRequest;
import com.model.OrderReview;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class OrderReviewServiceImpl implements OrderReviewService {
    private final OrderReviewDao orderReviewDao;

    public OrderReviewServiceImpl(OrderReviewDao orderReviewDao) {
        this.orderReviewDao = orderReviewDao;
    }

    @Override
    public List<OrderReview> getReviewsByOrderId(String orderId) {
        return orderReviewDao.getReviewsByOrderId(orderId);
    }

    @Override
    public Optional<OrderReview> getReviewById(String id) {
        return orderReviewDao.getReviewById(id);
    }

    @Override
    public OrderReview createReview(String orderId, OrderReviewRequest reviewRequest) {
        OrderReview review = new OrderReview();
        review.setId(UUID.randomUUID().toString());
        review.setOrderId(orderId);
        review.setName(reviewRequest.getName());
        review.setEmail(reviewRequest.getEmail());
        review.setOverallRating(reviewRequest.getOverallRating());
        review.setDeliveryRating(reviewRequest.getDeliveryRating());
        review.setPackagingRating(reviewRequest.getPackagingRating());
        review.setDate(new Date());
        review.setComment(reviewRequest.getComment());
        review.setLikes(0);
        
        return orderReviewDao.createReview(review);
    }

    @Override
    public boolean likeReview(String reviewId) {
        return orderReviewDao.incrementLikes(reviewId);
    }

    @Override
    public double getAverageRating(String orderId, String ratingField) {
        List<OrderReview> reviews = getReviewsByOrderId(orderId);
        
        if (reviews.isEmpty()) {
            return 0.0;
        }
        
        double sum = 0.0;
        
        for (OrderReview review : reviews) {
            switch (ratingField) {
                case "overallRating":
                    sum += review.getOverallRating();
                    break;
                case "deliveryRating":
                    sum += review.getDeliveryRating();
                    break;
                case "packagingRating":
                    sum += review.getPackagingRating();
                    break;
                default:
                    sum += review.getOverallRating();
            }
        }
        
        return sum / reviews.size();
    }
}
