package com.service;

import com.dao.OrderDAO;
import com.dto.request.RevenueDTO;
import com.model.Order;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class RevenueService {
    private OrderDAO orderDAO;

    public RevenueService() {
        this.orderDAO = new OrderDAO();
    }

    public List<RevenueDTO> getRevenueReport() throws SQLException {
        List<Order> orders = orderDAO.getOrdersByStatus("SUCCESS");
        Map<String, Double> revenueMap = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Order order : orders) {
            // Convert java.util.Date to LocalDateTime
            Date orderDate = order.getOrderDate();
            LocalDateTime localDateTime = orderDate.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
            // Extract LocalDate and format it
            String date = localDateTime.toLocalDate().format(formatter);
            revenueMap.put(date, revenueMap.getOrDefault(date, 0.0) + order.getTotalAmount());
        }
        
        List<RevenueDTO> result = new ArrayList<>();
        for (Map.Entry<String, Double> entry : revenueMap.entrySet()) {
            result.add(new RevenueDTO(entry.getKey(), entry.getValue()));
        }
        result.sort(Comparator.comparing(RevenueDTO::getDate));
        return result;
    }
}