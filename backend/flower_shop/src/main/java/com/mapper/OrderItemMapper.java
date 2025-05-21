package com.mapper;

import com.model.OrderItem;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class OrderItemMapper {

    public static Map<String, Object> toMap(OrderItem orderItem) {
        Map<String, Object> map = new HashMap<>();
        map.put("orderItemId", orderItem.getOrderItemId());
        map.put("orderId", orderItem.getOrderId());
        map.put("productId", orderItem.getProductId());
        map.put("productName", orderItem.getProductName());
        map.put("quantity", orderItem.getQuantity());
        map.put("price", orderItem.getPrice());
        map.put("imageUrl", orderItem.getImageUrl());
        return map;
    }

    public static List<Map<String, Object>> toMapList(List<OrderItem> orderItems) {
        return orderItems.stream()
                .map(OrderItemMapper::toMap)
                .collect(Collectors.toList());
    }
}