package com.mapper;

import com.model.Order;
import com.model.OrderItem;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class OrderMapper {

    public static Map<String, Object> toMap(Order order) {
        Map<String, Object> map = new HashMap<>();
        map.put("orderId", order.getOrderId());
        map.put("userId", order.getUserId());
        map.put("orderDate", order.getOrderDate() != null ? order.getOrderDate().toString() : null);
        map.put("totalAmount", order.getTotalAmount());
        map.put("status", order.getStatus());
        map.put("paymentMethod", order.getPaymentMethod());
        map.put("items", order.getItems() != null ? OrderItemMapper.toMapList(order.getItems()) : null); // Sử dụng OrderItemMapper
        map.put("shippingAddress", order.getShippingAddress());
        map.put("phoneNumber", order.getPhoneNumber());
        return map;
    }

    public static List<Map<String, Object>> toMapList(List<Order> orders) {
        return orders.stream()
                .map(OrderMapper::toMap)
                .collect(Collectors.toList());
    }
}