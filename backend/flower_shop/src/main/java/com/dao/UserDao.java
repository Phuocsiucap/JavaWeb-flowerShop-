package com.dao;

import com.model.User;
import com.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;
import java.util.UUID;

public class UserDao {
    public UserDao() {
        // constructor trống
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) return Optional.of(new User(
                    rs.getString("id"),
                    rs.getString("email"),
                    rs.getString("password"),
                    rs.getString("role"),
                    rs.getString("name"),
                    rs.getString("address"),
                    rs.getString("phone")
            ));

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    public User save(User user) {
        String sql = "INSERT INTO users (id, email, password, role, name, address, phone) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            if (user.getId() == null) {
                user.setId(UUID.randomUUID().toString());
            }
            if (user.getRole() == null) {
                user.setRole("ROLE_USER");
            }

            ps.setString(1, user.getId());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPassword()); // ✅ Thêm dòng này
            ps.setString(4, user.getRole());
            ps.setString(5, user.getName());
            ps.setString(6, user.getAddress());
            ps.setString(7, user.getPhone());

            int affectedRows = ps.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating user failed, no rows affected.");
            }
            return user;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error saving user", e);
        }
    }

    public void update(User user) {
        String sql = "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            // Set các giá trị mới cho người dùng
            ps.setString(1, user.getName());
            ps.setString(2, user.getPhone());
            ps.setString(3, user.getAddress());
            ps.setString(4, user.getId());

            // Thực thi câu lệnh SQL
            int affectedRows = ps.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Updating user failed, no rows affected.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error updating user", e);
        }
    }

}
