package com.mapper;

import com.model.OrderItem;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class OrderItemMapper {
    public static Map<String, Object> toMap(OrderItem item) {
        Map<String, Object> map = new HashMap<>();
        map.put("orderItemId", item.getOrderItemId());
        map.put("orderId", item.getOrderId());
        map.put("productId", item.getProductId());
        map.put("productName", item.getProductName());
        map.put("quantity", item.getQuantity());
        map.put("price", item.getPrice());
        map.put("imageUrl", item.getImageUrl());
        return map;
    }

    public static List<Map<String, Object>> toMapList(List<OrderItem> items) {
        return items.stream().map(OrderItemMapper::toMap).collect(Collectors.toList());
    }
}