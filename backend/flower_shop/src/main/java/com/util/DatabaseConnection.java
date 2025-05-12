package com.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    private static final String URL = "jdbc:mysql://localhost:3306/flower_shop";
    private static final String USER = "root";

    private static final String PASSWORD = "nguyenphuoc";

    private static Connection connection = null;

    static {
        try {
            // Đảm bảo rằng driver JDBC được load
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            throw new RuntimeException("JDBC Driver không tìm thấy!", e);
        }
    }

    public DatabaseConnection() {
        // constructor riêng tư để tránh khởi tạo đối tượng
    }

    // Phương thức để lấy kết nối cơ sở dữ liệu
    public static Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            connection = DriverManager.getConnection(URL, USER, PASSWORD);
        }
        return connection;
    }

    // Phương thức để đóng kết nối nếu không còn cần thiết
    public static void closeConnection() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
