package com.dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import com.util.DatabaseConnection;

import com.model.Payment;

public class PaymentDAO extends DatabaseConnection {
    
    public int createPayment(Payment payment) {
        String sql = "INSERT INTO payments (order_id, amount, payment_method, payment_date, transaction_id, status) "
                   + "VALUES (?, ?, ?, NOW(), ?, ?)";
        
        try (PreparedStatement statement = DatabaseConnection.getConnection().prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setInt(1, payment.getOrderId());
            statement.setDouble(2, payment.getAmount());
            statement.setString(3, payment.getPaymentMethod());
            statement.setString(4, payment.getTransactionId());
            statement.setString(5, payment.getStatus());
            
            int affectedRows = statement.executeUpdate();
            
            if (affectedRows == 0) {
                throw new SQLException("Creating payment failed, no rows affected.");
            }
            
            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    int paymentId = generatedKeys.getInt(1);
                    payment.setPaymentId(paymentId);
                    return paymentId;
                } else {
                    throw new SQLException("Creating payment failed, no ID obtained.");
                }
            }
        } catch (SQLException e) {
            System.out.println("Error creating payment: " + e.getMessage());
            return -1;
        }
    }
    
    public Payment getPaymentByOrderId(int orderId) {
        String sql = "SELECT * FROM payments WHERE order_id = ?";
        
        try (PreparedStatement statement = DatabaseConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(1, orderId);
            
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    Payment payment = new Payment();
                    payment.setPaymentId(resultSet.getInt("payment_id"));
                    payment.setOrderId(resultSet.getInt("order_id"));
                    payment.setAmount(resultSet.getDouble("amount"));
                    payment.setPaymentMethod(resultSet.getString("payment_method"));
                    payment.setPaymentDate(resultSet.getTimestamp("payment_date"));
                    payment.setTransactionId(resultSet.getString("transaction_id"));
                    payment.setStatus(resultSet.getString("status"));
                    
                    return payment;
                }
            }
        } catch (SQLException e) {
            System.out.println("Error getting payment: " + e.getMessage());
        }
        
        return null;
    }
    
    public boolean updatePaymentStatus(int paymentId, String status) {
        String sql = "UPDATE payments SET status = ? WHERE payment_id = ?";
        
        try (PreparedStatement statement = DatabaseConnection.getConnection().prepareStatement(sql)) {
            statement.setString(1, status);
            statement.setInt(2, paymentId);
            
            int affectedRows = statement.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            System.out.println("Error updating payment status: " + e.getMessage());
            return false;
        }
    }
}