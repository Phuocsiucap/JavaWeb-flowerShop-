package com.service;

import com.dao.OrderDAO;
import com.dao.ProductDAOImpl;
import com.dao.UserDao;
import com.dto.request.BestSellerDTO;
import com.dto.request.RevenueDTO;
import com.dto.request.TopCustomerDTO;
import com.model.Order;
import com.model.OrderItem;
import com.model.User;

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
	public List<TopCustomerDTO> getTopCustomersOfWeek() throws SQLException {
        // Lấy ngày đầu tuần (7 ngày trước)
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, -6);
        Date weekAgo = cal.getTime();
        List<Order> orders = orderDAO.getOrdersByStatusAndDate("SUCCESS", weekAgo);
        Map<String, TopCustomerDTO> customerMap = new HashMap<>();
        for (Order order : orders) {
            String userId = order.getUserId();
            User user = new UserDao().getUserById(userId);
            if (user == null) continue;
            TopCustomerDTO dto = customerMap.getOrDefault(userId, new TopCustomerDTO(user.getName(), user.getEmail(), 0));
            dto.setTotalAmount(dto.getTotalAmount() + order.getTotalAmount());
            customerMap.put(userId, dto);
        }
        List<TopCustomerDTO> result = new ArrayList<>(customerMap.values());
        result.sort((a, b) -> Double.compare(b.getTotalAmount(), a.getTotalAmount()));
        return result.size() > 3 ? result.subList(0, 3) : result;
    }

	public BestSellerDTO getBestSellerOfWeek() throws SQLException {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, -6);
        Date weekAgo = cal.getTime();
        List<Order> orders = orderDAO.getOrdersByStatusAndDate("SUCCESS", weekAgo);
        Map<Integer, Integer> productCount = new HashMap<>();
        Map<Integer, String> productNameMap = new HashMap<>();
        ProductDAOImpl productDAO = new ProductDAOImpl();
        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
                int productId = item.getProductId();
                int qty = item.getQuantity();
                productCount.put(productId, productCount.getOrDefault(productId, 0) + qty);
                if (!productNameMap.containsKey(productId)) {
                    productNameMap.put(productId, productDAO.getProductById(productId).getName());
                }
            }
        }
        int maxProductId = -1, maxQty = 0;
        for (Map.Entry<Integer, Integer> entry : productCount.entrySet()) {
            if (entry.getValue() > maxQty) {
                maxQty = entry.getValue();
                maxProductId = entry.getKey();
            }
        }
        if (maxProductId == -1) return null;
        return new BestSellerDTO(productNameMap.get(maxProductId), maxQty);
    }
}