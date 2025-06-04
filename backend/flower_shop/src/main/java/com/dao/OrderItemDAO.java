package com.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.model.Order;
import com.model.OrderItem;
import com.util.DatabaseConnection;

public class OrderItemDAO {
    
    public OrderItemDAO() {
        // Default constructor
    }
    
    public int createOrderWithItems(Order order) {
        Connection conn = null;
        PreparedStatement psOrder = null;
        PreparedStatement psItem = null;
        ResultSet rs = null;

        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);

            String sqlOrder = "INSERT INTO orders (userId, orderDate, totalAmount, status, paymentMethod, shippingAddress, phoneNumber) " +
                    "VALUES (?, NOW(), ?, ?, ?, ?, ?)";
            psOrder = conn.prepareStatement(sqlOrder, Statement.RETURN_GENERATED_KEYS);
            psOrder.setString(1, order.getUserId());
            psOrder.setDouble(2, order.getTotalAmount());
            psOrder.setString(3, order.getStatus());
            psOrder.setString(4, order.getPaymentMethod());
            psOrder.setString(5, order.getShippingAddress());
            psOrder.setString(6, order.getPhoneNumber());

            int affected = psOrder.executeUpdate();
            if (affected == 0) {
                conn.rollback();
                return -1;
            }

            rs = psOrder.getGeneratedKeys();
            if (!rs.next()) {
                conn.rollback();
                return -1;
            }

            int orderId = rs.getInt(1);
            order.setOrderId(orderId);

            String sqlItem = "INSERT INTO orderitem (orderId, productId, productName, quantity, price, imageUrl) VALUES (?, ?, ?, ?, ?, ?)";
            psItem = conn.prepareStatement(sqlItem);

            for (OrderItem item : order.getItems()) {
                psItem.setInt(1, orderId);
                psItem.setInt(2, item.getProductId());
                psItem.setString(3, item.getProductName());
                psItem.setInt(4, item.getQuantity());
                psItem.setDouble(5, item.getPrice());
                psItem.setString(6, item.getImageUrl());
                psItem.executeUpdate();
            }

            conn.commit();
            return orderId;

        } catch (SQLException e) {
            e.printStackTrace();
            try { if (conn != null) conn.rollback(); } catch (SQLException ignore) {}
            return -1;
        } finally {
            try { if (rs != null) rs.close(); } catch (SQLException ignore) {}
            try { if (psOrder != null) psOrder.close(); } catch (SQLException ignore) {}
            try { if (psItem != null) psItem.close(); } catch (SQLException ignore) {}
            if (conn != null) {
                try { 
                    conn.setAutoCommit(true); 
                } catch (SQLException ignore) {}
                DatabaseConnection.returnConnection(conn);
            }
        }
    }
    
    public List<OrderItem> getOrderItemsByOrderId(int orderId) {
        List<OrderItem> items = new ArrayList<>();
        String sql = "SELECT * FROM orderitem WHERE orderId = ?";
        Connection conn = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement statement = conn.prepareStatement(sql)) {
                statement.setInt(1, orderId);
                
                try (ResultSet resultSet = statement.executeQuery()) {
                    while (resultSet.next()) {
                        OrderItem item = new OrderItem();
                        item.setOrderItemId(resultSet.getInt("orderItemId"));
                        item.setOrderId(resultSet.getInt("orderId"));
                        item.setProductId(resultSet.getInt("productId"));
                        item.setProductName(resultSet.getString("productName"));
                        item.setQuantity(resultSet.getInt("quantity"));
                        item.setPrice(resultSet.getDouble("price"));
                        item.setImageUrl(resultSet.getString("imageUrl"));
                        
                        items.add(item);
                    }
                }
            }
        } catch (SQLException e) {
            System.out.println("Error getting order items: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.returnConnection(conn);
            }
        }
        
        return items;
    }
}