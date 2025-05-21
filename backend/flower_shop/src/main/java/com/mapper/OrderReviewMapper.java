package com.mapper;


import com.model.Order;
import com.model.OrderReview;

import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class OrderReviewMapper {

    public static Map<String, Object> toMap(OrderReview review) {
       
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        
        Map<String, Object> map = new HashMap<>();
        map.put("id", review.getId());
        map.put("orderId", review.getOrderId());
        map.put("name", review.getName());
        map.put("email", review.getEmail());
        map.put("overallRating", review.getOverallRating());
        map.put("deliveryRating", review.getDeliveryRating());
        map.put("packagingRating", review.getPackagingRating());
        map.put("date", review.getDate() != null ? sdf.format(review.getDate()) : null);
        map.put("comment", review.getComment());
        map.put("likes", review.getLikes());
        
        return map;
    }

    public static List<Map<String, Object>> toMapList(List<OrderReview> reviews) {
        return reviews.stream()
                .map(OrderReviewMapper::toMap)
                .collect(Collectors.toList());
    }
}