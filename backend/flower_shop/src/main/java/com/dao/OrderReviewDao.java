package com.dao;

import com.model.OrderReview;
import com.util.DatabaseConnection;

import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Date;


public class OrderReviewDao {
    private Connection getConnection() throws SQLException {
        return DatabaseConnection.getConnection();
    }

    public List<OrderReview> getReviewsByOrderId(String orderId) {
        List<OrderReview> reviews = new ArrayList<>();
        
        try (Connection conn = getConnection()) {
            PreparedStatement stmt = conn.prepareStatement(
                "SELECT * FROM order_review WHERE order_id = ? ORDER BY date DESC"
            );
            stmt.setString(1, orderId);
            
            ResultSet rs = stmt.executeQuery();
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            
            while (rs.next()) {
                OrderReview review = new OrderReview();
                review.setId(rs.getString("id"));
                review.setOrderId(rs.getString("order_id"));
                review.setName(rs.getString("name"));
                review.setEmail(rs.getString("email"));
                review.setOverallRating(rs.getInt("overall_rating"));
                review.setDeliveryRating(rs.getInt("delivery_rating"));
                review.setPackagingRating(rs.getInt("packaging_rating"));
                try {
                    review.setDate(dateFormat.parse(rs.getString("date")));
                } catch (ParseException e) {
                    // Handle parse exception
                }
                review.setComment(rs.getString("comment"));
                review.setLikes(rs.getInt("likes"));
                
                reviews.add(review);
            }
            
        } catch (SQLException e) {
            // Handle SQL exception
            e.printStackTrace();
        }
        
        return reviews;
    }

    public Optional<OrderReview> getReviewById(String id) {
        try (Connection conn = getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM order_review WHERE id = ?");
            stmt.setString(1, id);
            
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                OrderReview review = new OrderReview();
                review.setId(rs.getString("id"));
                review.setOrderId(rs.getString("order_id"));
                review.setName(rs.getString("name"));
                review.setEmail(rs.getString("email"));
                review.setOverallRating(rs.getInt("overall_rating"));
                review.setDeliveryRating(rs.getInt("delivery_rating"));
                review.setPackagingRating(rs.getInt("packaging_rating"));
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                try {
                    review.setDate(dateFormat.parse(rs.getString("date")));
                } catch (ParseException e) {
                    // Handle parse exception
                }
                review.setComment(rs.getString("comment"));
                review.setLikes(rs.getInt("likes"));
                
                return Optional.of(review);
            }
            
        } catch (SQLException e) {
            // Handle SQL exception
            e.printStackTrace();
        }
        
        return Optional.empty();
    }

    public OrderReview createReview(OrderReview review) {
        try (Connection conn = getConnection()) {
            String sql = "INSERT INTO order_review (id, order_id, name, email, overall_rating, delivery_rating, packaging_rating, date, comment, likes) " +
                         "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            review.setId(UUID.randomUUID().toString());
            if (review.getDate() == null) {
                review.setDate(new Date());
            }
            
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, review.getId());
            stmt.setString(2, review.getOrderId());
            stmt.setString(3, review.getName());
            stmt.setString(4, review.getEmail());
            stmt.setInt(5, review.getOverallRating());
            stmt.setInt(6, review.getDeliveryRating());
            stmt.setInt(7, review.getPackagingRating());
            
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            stmt.setString(8, dateFormat.format(review.getDate()));
            
            stmt.setString(9, review.getComment());
            stmt.setInt(10, review.getLikes());
            
            stmt.executeUpdate();
            
            return review;
        } catch (SQLException e) {
            // Handle SQL exception
            e.printStackTrace();
            return null;
        }
    }

    public boolean incrementLikes(String reviewId) {
        try (Connection conn = getConnection()) {
            String sql = "UPDATE order_review SET likes = likes + 1 WHERE id = ?";
            
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, reviewId);
            
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            // Handle SQL exception
            e.printStackTrace();
            return false;
        }
    }
}
