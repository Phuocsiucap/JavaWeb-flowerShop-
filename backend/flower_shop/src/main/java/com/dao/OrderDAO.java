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

public class OrderDAO {

    public OrderDAO() {
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

    public boolean deleteOrder(int orderId) {
        String sqlDeleteItems = "DELETE FROM orderitem WHERE orderId = ?";
        String sqlDeleteOrder = "DELETE FROM orders WHERE orderId = ?";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
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
        } finally {
            if (conn != null) {
                try { 
                    conn.setAutoCommit(true); 
                } catch (SQLException ignore) {}
                DatabaseConnection.returnConnection(conn);
            }
        }
    }

    public Order getOrderById(int orderId) {
        String sql = "SELECT * FROM orders WHERE orderId = ?";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement statement = conn.prepareStatement(sql)) {
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
            }
        } catch (SQLException e) {
            System.out.println("Error getting order: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.returnConnection(conn);
            }
        }

        return null;
    }

    public boolean updateOrderStatus(int orderId, String status) {
        String sql = "UPDATE orders SET status = ? WHERE orderId = ?";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement statement = conn.prepareStatement(sql)) {
                statement.setString(1, status);
                statement.setInt(2, orderId);

                int affectedRows = statement.executeUpdate();
                return affectedRows > 0;
            }
        } catch (SQLException e) {
            System.out.println("Error updating order status: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.returnConnection(conn);
            }
        }
    }

    public List<Order> getOrdersByUserId(String userId) {
        List<Order> orders = new ArrayList<>();
        String sql = "SELECT * FROM orders WHERE userId = ? ORDER BY orderDate DESC";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement statement = conn.prepareStatement(sql)) {
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
            }
        } catch (SQLException e) {
            System.out.println("Error getting orders by user ID: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.returnConnection(conn);
            }
        }

        return orders;
    }
    
    public List<Order> getAllOrders() {
        String sql = "SELECT * FROM orders";
        List<Order> orders = new ArrayList<>();
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement statement = conn.prepareStatement(sql);
                 ResultSet resultSet = statement.executeQuery()) {

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

	                OrderItemDAO orderItemDAO = new OrderItemDAO();
	                List<OrderItem> items = orderItemDAO.getOrderItemsByOrderId(order.getOrderId());
	                order.setItems(items);

                    orders.add(order);
                }
            }
        } catch (SQLException e) {
            System.out.println("Error getting all orders: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.returnConnection(conn);
            }
        }

        return orders;
    }
    
    public List<Order> getOrdersByStatus(String status) {
        List<Order> orders = new ArrayList<>();
        String sql = "SELECT * FROM orders WHERE status = ? ORDER BY orderDate ASC";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement statement = conn.prepareStatement(sql)) {
                statement.setString(1, status);

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
            }
        } catch (SQLException e) {
            System.out.println("Error getting orders by status: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.returnConnection(conn);
            }
        }

        return orders;
    }
    public List<Order> getOrdersByStatusAndDate(String status, java.util.Date fromDate) {
        List<Order> orders = new ArrayList<>();
        String sql = "SELECT * FROM orders WHERE status = ? AND orderDate >= ? ORDER BY orderDate ASC";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement statement = conn.prepareStatement(sql)) {
                statement.setString(1, status);
                statement.setTimestamp(2, new java.sql.Timestamp(fromDate.getTime()));

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

                        // Lấy danh sách order item nếu cần
                        OrderItemDAO orderItemDAO = new OrderItemDAO();
                        List<OrderItem> items = orderItemDAO.getOrderItemsByOrderId(order.getOrderId());
                        order.setItems(items);

                        orders.add(order);
                    }
                }
            }
        } catch (SQLException e) {
            System.out.println("Error getting orders by status and date: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.returnConnection(conn);
            }
        }

        return orders;
    }

}
