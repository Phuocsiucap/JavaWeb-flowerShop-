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
        String sql = "INSERT INTO order_items (order_id, product_id, product_name, quantity, price, image_url) "
                   + "VALUES (?, ?, ?, ?, ?, ?)";
        
        try (PreparedStatement statement = DatabaseConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(1, item.getOrderId());
            statement.setInt(2, item.getProductId());
            statement.setString(3, item.getProductName());
            statement.setInt(4, item.getQuantity());
            statement.setDouble(5, item.getPrice());
            statement.setString(6, item.getImageUrl());
            
            int affectedRows = statement.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            System.out.println("Error creating order item: " + e.getMessage());
            return false;
        }
    }
    
    public List<OrderItem> getOrderItemsByOrderId(int orderId) {
        List<OrderItem> items = new ArrayList<>();
        String sql = "SELECT * FROM order_items WHERE order_id = ?";
        
        try (PreparedStatement statement = DatabaseConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(1, orderId);
            
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    OrderItem item = new OrderItem();
                    item.setOrderItemId(resultSet.getInt("order_item_id"));
                    item.setOrderId(resultSet.getInt("order_id"));
                    item.setProductId(resultSet.getInt("product_id"));
                    item.setProductName(resultSet.getString("product_name"));
                    item.setQuantity(resultSet.getInt("quantity"));
                    item.setPrice(resultSet.getDouble("price"));
                    item.setImageUrl(resultSet.getString("image_url"));
                    
                    items.add(item);
                }
            }
        } catch (SQLException e) {
            System.out.println("Error getting order items: " + e.getMessage());
        }
        
        return items;
    }
}