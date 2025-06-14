package com.dao;

import com.model.OrderReview;
import com.util.DatabaseConnection;

import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Date;


public class OrderReviewDao {
    public List<OrderReview> getAllReviews() {
        List<OrderReview> reviews = new ArrayList<>();
        String sql = "SELECT * FROM order_review ORDER BY date DESC";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {

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
                        review.setDate(null);
                    }
                    review.setComment(rs.getString("comment"));
                    review.setLikes(rs.getInt("likes"));

                    reviews.add(review);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            if (conn != null) {
            	DatabaseConnection.closeConnection();
            }
        }

        return reviews;
    }

    

    public Optional<OrderReview> getReviewById(String id) {
        Connection conn = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM order_review WHERE order_id = ?");
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
        } finally {
            if (conn != null) {
            	DatabaseConnection.closeConnection();
            }
        }
        
        return Optional.empty();
    }

    public OrderReview createReview(OrderReview review) {
        Connection conn = null;
        
        try {
            conn = DatabaseConnection.getConnection();
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
        } finally {
            if (conn != null) {
            	DatabaseConnection.closeConnection();
            }
        }
    }

    public boolean incrementLikes(String reviewId) {
        Connection conn = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            String sql = "UPDATE order_review SET likes = likes + 1 WHERE id = ?";
            
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, reviewId);
            
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            // Handle SQL exception
            e.printStackTrace();
            return false;
        } finally {
            if (conn != null) {
            	DatabaseConnection.closeConnection();
            }
        }
    }
    
    public List<OrderReview> findReviewsByProductId(String productId) {
        List<OrderReview> reviews = new ArrayList<>();

        String sql = "SELECT r.* FROM order_review r " +
                     "JOIN orders o ON r.order_id = o.orderId " +
                     "JOIN orderitem i ON o.orderId = i.orderId " +
                     "WHERE i.productId = ? " +
                     "ORDER BY r.date DESC";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, productId);

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
                        // Nếu lỗi parse thì set null hoặc date mặc định
                        review.setDate(null);
                    }
                    review.setComment(rs.getString("comment"));
                    review.setLikes(rs.getInt("likes"));

                    reviews.add(review);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            if (conn != null) {
            	DatabaseConnection.closeConnection();
            }
        }

        return reviews;
    }


}
