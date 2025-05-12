package com.dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.model.OrderItem;
import com.util.DatabaseConnection;



public class OrderItemDAO extends DatabaseConnection {
    
    public boolean createOrderItem(OrderItem item) {
        String sql = "INSERT INTO orderitem (orderId, productId, productName, quantity, price, imageUrl) "
                   + "VALUES (?, ?, ?, ?, ?, ?)";
        
        try (PreparedStatement statement = DatabaseConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(2, item.getOrderId());
            statement.setInt(3, item.getProductId());
            statement.setString(4, item.getProductName());
            statement.setInt(5, item.getQuantity());
            statement.setDouble(6, item.getPrice());
            statement.setString(7, item.getImageUrl());
            
            int affectedRows = statement.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            System.out.println("Error creating order item: " + e.getMessage());
            return false;
        }
    }
    
    public List<OrderItem> getOrderItemsByOrderId(int orderId) {
        List<OrderItem> items = new ArrayList<>();
        String sql = "SELECT * FROM orderitem WHERE orderId = ?";
        
        try (PreparedStatement statement = DatabaseConnection.getConnection().prepareStatement(sql)) {
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
        } catch (SQLException e) {
            System.out.println("Error getting order items: " + e.getMessage());
        }
        
        return items;
    }
}