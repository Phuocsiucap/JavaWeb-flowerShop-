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

            String sqlItem = "INSERT INTO orderitem (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)";
            psItem = conn.prepareStatement(sqlItem);

            for (OrderItem item : order.getItems()) {
                psItem.setInt(1, orderId);
                psItem.setInt(2, item.getProductId());
                psItem.setInt(3, item.getQuantity());
                psItem.setDouble(4, item.getPrice());
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
            try { if (conn != null) conn.setAutoCommit(true); conn.close(); } catch (SQLException ignore) {}
        }
    }

    public boolean deleteOrder(int orderId) {
        String sqlDeleteItems = "DELETE FROM orderitem WHERE orderId = ?";
        String sqlDeleteOrder = "DELETE FROM orders WHERE orderId = ?";

        try (Connection conn = DatabaseConnection.getConnection()) {
            conn.setAutoCommit(false);

            try (PreparedStatement psItem = conn.prepareStatement(sqlDeleteItems);
                 PreparedStatement psOrder = conn.prepareStatement(sqlDeleteOrder)) {

                psItem.setInt(1, orderId);
                psItem.executeUpdate();

                psOrder.setInt(1, orderId);
                int rows = psOrder.executeUpdate();

                conn.commit();
                return rows > 0;
            } catch (SQLException e) {
                conn.rollback();
                e.printStackTrace();
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public Order getOrderById(int orderId) {
        String sql = "SELECT * FROM orders WHERE orderId = ?";

        try (PreparedStatement statement = DatabaseConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(1, orderId);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    Order order = new Order();
                    order.setOrderId(resultSet.getInt("orderId"));
                    order.setUserId(resultSet.getString("userId"));
                    order.setOrderDate(resultSet.getTimestamp("orderDate"));
                    order.setTotalAmount(resultSet.getDouble("totalAmount"));
                    order.setStatus(resultSet.getString("status"));
                    order.setPaymentMethod(resultSet.getString("paymentMethod"));
                    order.setShippingAddress(resultSet.getString("shippingAddress"));
                    order.setPhoneNumber(resultSet.getString("phoneNumber"));

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
        String sql = "UPDATE orders SET status = ? WHERE orderId = ?";

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

    public List<Order> getOrdersByUserId(String userId) {
        List<Order> orders = new ArrayList<>();
        String sql = "SELECT * FROM orders WHERE userId = ? ORDER BY orderDate DESC";

        try (PreparedStatement statement = DatabaseConnection.getConnection().prepareStatement(sql)) {
            statement.setString(1, userId);

            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    Order order = new Order();
                    order.setOrderId(resultSet.getInt("orderId"));
                    order.setUserId(resultSet.getString("userId"));
                    order.setOrderDate(resultSet.getTimestamp("orderDate"));
                    order.setTotalAmount(resultSet.getDouble("totalAmount"));
                    order.setStatus(resultSet.getString("status"));
                    order.setPaymentMethod(resultSet.getString("paymentMethod"));
                    order.setShippingAddress(resultSet.getString("shippingAddress"));
                    order.setPhoneNumber(resultSet.getString("phoneNumber"));

                    orders.add(order);
                }
            }
        } catch (SQLException e) {
            System.out.println("Error getting orders by user ID: " + e.getMessage());
        }

        return orders;
    }
}
