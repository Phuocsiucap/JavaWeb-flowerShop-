package com.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.model.Order;
import com.util.DatabaseConnection;

public class OrderDAO {

    public OrderDAO() {
        // Default constructor
    }

    // Tạo đơn hàng mới (chỉ thêm vào bảng orders)
    public int createOrder(Order order) {
        Connection conn = null;
        PreparedStatement psOrder = null;
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

            conn.commit();
            return orderId;

        } catch (SQLException e) {
            e.printStackTrace();
            try { if (conn != null) conn.rollback(); } catch (SQLException ignore) {}
            return -1;
        } finally {
            try { if (rs != null) rs.close(); } catch (SQLException ignore) {}
            try { if (psOrder != null) psOrder.close(); } catch (SQLException ignore) {}
            if (conn != null) {
                try { conn.setAutoCommit(true); } catch (SQLException ignore) {}
                DatabaseConnection.closeConnection();
            }
        }
    }

    // Xóa đơn hàng và các mặt hàng liên quan
    public boolean deleteOrder(int orderId) {
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);

            // Xóa mặt hàng trước
            OrderItemDAO orderItemDAO = new OrderItemDAO();
            boolean itemsDeleted = orderItemDAO.deleteOrderItemsByOrderId(orderId);
            if (!itemsDeleted) {
                conn.rollback();
                return false;
            }

            // Xóa đơn hàng
            String sqlDeleteOrder = "DELETE FROM orders WHERE orderId = ?";
            try (PreparedStatement psOrder = conn.prepareStatement(sqlDeleteOrder)) {
                psOrder.setInt(1, orderId);
                int rows = psOrder.executeUpdate();

                conn.commit();
                return rows > 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            try { if (conn != null) conn.rollback(); } catch (SQLException ignore) {}
            return false;
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); } catch (SQLException ignore) {}
                DatabaseConnection.closeConnection();
            }
        }
    }

    // Lấy đơn hàng theo ID
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

                        return order;
                    }
                }
            }
        } catch (SQLException e) {
            System.out.println("Lỗi khi lấy đơn hàng: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.closeConnection();
            }
        }

        return null;
    }

    // Cập nhật trạng thái đơn hàng
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
            System.out.println("Lỗi khi cập nhật trạng thái đơn hàng: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.closeConnection();
            }
        }
    }

    // Lấy danh sách đơn hàng theo userId
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
            System.out.println("Lỗi khi lấy đơn hàng theo userId: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.closeConnection();
            }
        }

        return orders;
    }

    // Lấy tất cả đơn hàng
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

                    orders.add(order);
                }
            }
        } catch (SQLException e) {
            System.out.println("Lỗi khi lấy tất cả đơn hàng: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.closeConnection();
            }
        }

        return orders;
    }

    // Lấy danh sách đơn hàng theo trạng thái
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
            System.out.println("Lỗi khi lấy đơn hàng theo trạng thái: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.closeConnection();
            }
        }

        return orders;
    }

    // Lấy danh sách đơn hàng theo trạng thái và ngày
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

                        orders.add(order);
                    }
                }
            }
        } catch (SQLException e) {
            System.out.println("Lỗi khi lấy đơn hàng theo trạng thái và ngày: " + e.getMessage());
        } finally {
            if (conn != null) {
                DatabaseConnection.closeConnection();
            }
        }

        return orders;
    }
}