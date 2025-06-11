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