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



public class OrderDAO extends DatabaseConnection {
    
    public int createOrder(Order order) {
        String sql = "INSERT INTO orders (user_id, order_date, total_amount, status, payment_method, shipping_address, phone_number) "
                   + "VALUES (?, NOW(), ?, ?, ?, ?, ?)";
        
        try (PreparedStatement statement = DatabaseConnection.getConnection().prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setInt(1, order.getUserId());
            statement.setDouble(2, order.getTotalAmount());
            statement.setString(3, order.getStatus());
            statement.setString(4, order.getPaymentMethod());
            statement.setString(5, order.getShippingAddress());
            statement.setString(6, order.getPhoneNumber());
            
            int affectedRows = statement.executeUpdate();
            
            if (affectedRows == 0) {
                throw new SQLException("Creating order failed, no rows affected.");
            }
            
            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    int orderId = generatedKeys.getInt(1);
                    order.setOrderId(orderId);
                    
                    // Insert order items
                    OrderItemDAO orderItemDAO = new OrderItemDAO();
                    for (OrderItem item : order.getItems()) {
                        item.setOrderId(orderId);
                        orderItemDAO.createOrderItem(item);
                    }
                    
                    return orderId;
                } else {
                    throw new SQLException("Creating order failed, no ID obtained.");
                }
            }
        } catch (SQLException e) {
            System.out.println("Error creating order: " + e.getMessage());
            return -1;
        }
    }
    
    public Order getOrderById(int orderId) {
        String sql = "SELECT * FROM orders WHERE order_id = ?";
        
        try (PreparedStatement statement = DatabaseConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(1, orderId);
            
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    Order order = new Order();
                    order.setOrderId(resultSet.getInt("order_id"));
                    order.setUserId(resultSet.getInt("user_id"));
                    order.setOrderDate(resultSet.getTimestamp("order_date"));
                    order.setTotalAmount(resultSet.getDouble("total_amount"));
                    order.setStatus(resultSet.getString("status"));
                    order.setPaymentMethod(resultSet.getString("payment_method"));
                    order.setShippingAddress(resultSet.getString("shipping_address"));
                    order.setPhoneNumber(resultSet.getString("phone_number"));
                    
                    // Get order items
                    OrderItemDAO orderItemDAO = new OrderItemDAO();
                    List<OrderItem> items = orderItemDAO.getOrderItemsByOrderId(orderId);
                    order.setItems(items);
                    
                    return order;
                }
            }
        } catch (SQLException e) {
            System.out.println("Error getting order: " + e.getMessage());
        }
        
        return null;
    }
    
    public boolean updateOrderStatus(int orderId, String status) {
        String sql = "UPDATE orders SET status = ? WHERE order_id = ?";
        
        try (PreparedStatement statement = DatabaseConnection.getConnection().prepareStatement(sql)) {
            statement.setString(1, status);
            statement.setInt(2, orderId);
            
            int affectedRows = statement.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            System.out.println("Error updating order status: " + e.getMessage());
            return false;
        }
    }
    
    public List<Order> getOrdersByUserId(int userId) {
        List<Order> orders = new ArrayList<>();
        String sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC";
        
        try (PreparedStatement statement = DatabaseConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(1, userId);
            
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    Order order = new Order();
                    order.setOrderId(resultSet.getInt("order_id"));
                    order.setUserId(resultSet.getInt("user_id"));
                    order.setOrderDate(resultSet.getTimestamp("order_date"));
                    order.setTotalAmount(resultSet.getDouble("total_amount"));
                    order.setStatus(resultSet.getString("status"));
                    order.setPaymentMethod(resultSet.getString("payment_method"));
                    order.setShippingAddress(resultSet.getString("shipping_address"));
                    order.setPhoneNumber(resultSet.getString("phone_number"));
                    
                    orders.add(order);
                }
            }
        } catch (SQLException e) {
            System.out.println("Error getting orders by user ID: " + e.getMessage());
        }
        
        return orders;
    }
}