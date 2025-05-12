package com.dao;

import com.model.Cart;
import com.model.CartItem;
import com.util.DatabaseConnection;

import java.sql.*;
import java.util.Optional;

public class CartDAO {

    // Tìm giỏ hàng theo userId
    public Optional<Cart> findByUserID(String userId) {
        String sql = "SELECT * FROM cart WHERE userId = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, userId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Cart cart = new Cart(
                    rs.getInt("cartId"),
                    rs.getDouble("shippingFee"),
                    rs.getString("userId")
                );
                return Optional.of(cart);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    // Lưu giỏ hàng mới và trả về cartId được sinh tự động
    public int save(Cart cart) {
        String sql = "INSERT INTO cart (userId, shippingFee) VALUES (?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, cart.getUserId());
            stmt.setDouble(2, cart.getShippingFee());
            stmt.executeUpdate();

            // Lấy cartId được sinh tự động
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1; // Trả về -1 nếu lỗi
    }

    // Tìm CartItem theo cartId và productId
    public Optional<CartItem> findCartItemByProductId(int cartId, int productId) {
        String sql = "SELECT * FROM cartitem WHERE cartId = ? AND productId = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, cartId);
            stmt.setInt(2, productId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                CartItem item = new CartItem(
                    rs.getInt("productId"),
                    rs.getString("name"),
                    rs.getDouble("price"),
                    rs.getInt("quantity"),
                    rs.getString("imageUrl")
                );
                item.setCartId(rs.getInt("cartId"));
                return Optional.of(item);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    // Thêm mới CartItem
    public void addCartItem(CartItem item) {
        String sql = "INSERT INTO cartitem (cartId, productId, name, price, quantity, imageUrl) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, item.getCartId());
            stmt.setInt(2, item.getProductId());
            stmt.setString(3, item.getName());
            stmt.setDouble(4, item.getPrice());
            stmt.setInt(5, item.getQuantity());
            stmt.setString(6, item.getImageUrl());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

 // Cập nhật CartItem
    public void updateCartItem(CartItem item) {
        String sql = "UPDATE cartitem SET quantity = ?, price = ?, name = ?, imageUrl = ? WHERE cartId = ? AND productId = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, item.getQuantity());
            stmt.setDouble(2, item.getPrice());
            stmt.setString(3, item.getName());
            stmt.setString(4, item.getImageUrl());
            stmt.setInt(5, item.getCartId());
            stmt.setInt(6, item.getProductId());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // Xóa CartItem theo cartId và productId
    public void deleteCartItem(int cartId, int productId) {
        String sql = "DELETE FROM cartitem WHERE cartId = ? AND productId = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, cartId);
            stmt.setInt(2, productId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}