package com.dao;

import com.model.User;
import com.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class UserDao {
    public UserDao() {
        
    }


    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                Timestamp loginTs = rs.getTimestamp("lastLogin");
                Timestamp createdTs = rs.getTimestamp("createdAt");
              

                return Optional.of(new User(
                        rs.getString("id"),
                        rs.getString("email"),
                        rs.getString("password"),
                        rs.getString("name"),
                        rs.getString("address"),
                        rs.getString("phone"),
                        rs.getString("role"),
                        loginTs != null ? loginTs.toLocalDateTime() : null,
                        createdTs != null ? createdTs.toLocalDateTime() : null,
                        rs.getString("status")
                ));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }


    public User save(User user) {
        String sql = "INSERT INTO users (id, email, password, role, name, address, phone, createdAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            if (user.getId() == null) {
                user.setId(UUID.randomUUID().toString());
            }
            if (user.getRole() == null) {
                user.setRole("customer");
            }
            if (user.getCreatedAt() == null) {
                user.setCreatedAt(LocalDateTime.now()); 
            }
            if(user.getStatus() == null ) {
            	user.setStatus("inactive");
            }

            ps.setString(1, user.getId());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPassword());
            ps.setString(4, user.getRole());
            ps.setString(5, user.getName());
            ps.setString(6, user.getAddress());
            ps.setString(7, user.getPhone());
            ps.setTimestamp(8, Timestamp.valueOf(user.getCreatedAt()));
            ps.setString(9,  user.getStatus());
            

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
        String sql = "UPDATE users SET name = ?, phone = ?, address = ?, role = ?, email = ?, status = ? , lastLogin = ?  WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            // Set các giá trị mới cho người dùng
            ps.setString(1, user.getName());
            ps.setString(2, user.getPhone());
            ps.setString(3, user.getAddress());
            ps.setString(4, user.getRole());
            ps.setString(5, user.getEmail());
            ps.setString(6,  user.getStatus());
            if (user.getLastLogin() != null) {
                ps.setTimestamp(7, Timestamp.valueOf(user.getLastLogin()));
            } else {
                ps.setTimestamp(7, null); 
            }
            
            ps.setString(8, user.getId());
           

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
    
    public Optional<User> findById(String id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, id);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                Timestamp loginTs = rs.getTimestamp("lastLogin");
                Timestamp createdTs = rs.getTimestamp("createdAt");

                User user = new User(
                    rs.getString("id"),
                    rs.getString("email"),
                    rs.getString("password"),
                    rs.getString("name"),
                    rs.getString("address"),
                    rs.getString("phone"),
                    rs.getString("role"),
                    loginTs != null ? loginTs.toLocalDateTime() : null,
                    createdTs != null ? createdTs.toLocalDateTime() : null, 
                    rs.getString("status")
                );

                return Optional.of(user);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return Optional.empty();
    }

    
    public boolean deleteById(String id) {
        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, id);
            int affectedRows = ps.executeUpdate();
            
            return affectedRows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public List<User> findAll() {
        String sql = "SELECT * FROM users";
        List<User> users = new ArrayList<>();

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Timestamp loginTs = rs.getTimestamp("lastLogin");
                Timestamp createdTs = rs.getTimestamp("createdAt");

                users.add(new User(
                        rs.getString("id"),
                        rs.getString("email"),
                        rs.getString("password"),
                        rs.getString("name"),
                        rs.getString("address"),
                        rs.getString("phone"),
                        rs.getString("role"),
                        loginTs != null ? loginTs.toLocalDateTime() : null,
                        createdTs != null ? createdTs.toLocalDateTime() : null,
                        rs.getString("status")
                ));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return users;
    }

    
    public void updatePassword(String userId, String hashedPassword) {
        String sql = "UPDATE users SET password = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, hashedPassword);
            ps.setString(2, userId);

            int affectedRows = ps.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Updating password failed, no rows affected.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error updating password", e);
        }
    }
}