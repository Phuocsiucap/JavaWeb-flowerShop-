package com.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.model.OrderItem;
import com.util.DatabaseConnection;

public class OrderItemDAO {

    public OrderItemDAO() {
        // Default constructor
    }

    // Thêm danh sách OrderItem vào cơ sở dữ liệu
    public boolean createOrderItems(int orderId, List<OrderItem> items) {
        Connection conn = null;
        PreparedStatement psItem = null;

        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);

            String sqlItem = "INSERT INTO orderitem (orderId, productId, productName, quantity, price, imageUrl) VALUES (?, ?, ?, ?, ?, ?)";
            psItem = conn.prepareStatement(sqlItem);

            for (OrderItem item : items) {
                psItem.setInt(1, orderId);
                psItem.setInt(2, item.getProductId());
                psItem.setString(3, item.getProductName());
                psItem.setInt(4, item.getQuantity());
                psItem.setDouble(5, item.getPrice());
                psItem.setString(6, item.getImageUrl());
                psItem.executeUpdate();
            }

            conn.commit();
            return true;

        } catch (SQLException e) {
            e.printStackTrace();
            try { if (conn != null) conn.rollback(); } catch (SQLException ignore) {}
            return false;
        } finally {
            try { if (psItem != null) psItem.close(); } catch (SQLException ignore) {}
            if (conn != null) {
                try { conn.setAutoCommit(true); } catch (SQLException ignore) {}
                DatabaseConnection.closeConnection();
            }
        }
    }

    // Lấy danh sách OrderItem theo orderId
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
            System.out.println("Lỗi khi lấy mặt hàng: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.closeConnection();
            }
        }

        return items;
    }

    // Xóa tất cả OrderItem theo orderId
    public boolean deleteOrderItemsByOrderId(int orderId) {
        String sql = "DELETE FROM orderitem WHERE orderId = ?";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement statement = conn.prepareStatement(sql)) {
                statement.setInt(1, orderId);
                int rows = statement.executeUpdate();
                return rows >= 0; // Trả về true nếu xóa thành công hoặc không có mặt hàng nào
            }
        } catch (SQLException e) {
            System.out.println("Lỗi khi xóa mặt hàng: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.closeConnection();
            }
        }
    }
}