package com.dao;

import com.model.Product;
import com.util.DatabaseConnection;

import java.sql.*;
import java.util.*;

public class ProductDAOImpl implements ProductDAO {

    @Override
    public List<Product> getAllProducts() {
        List<Product> list = new ArrayList<>();
        String sql = "SELECT * FROM products";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {

                while (rs.next()) {
                    Product p = new Product();
                    p.setId(rs.getInt("id"));
                    p.setName(rs.getString("name"));
                    p.setDescription(rs.getString("description"));
                    p.setPrice(rs.getDouble("price"));
                    p.setImageUrl(rs.getString("imageUrl"));
                    p.setDiscount(rs.getFloat("discount"));
                    p.setCategory(rs.getString("category"));
                    p.setOccasion(rs.getString("occasion"));
                    p.setStock(rs.getInt("stock"));
                    list.add(p);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (conn != null) {
                DatabaseConnection.returnConnection(conn);
            }
        }

        return list;
    }

    @Override
    public Product getProductById(int id) {
        Product p = null;
        String sql = "SELECT * FROM products WHERE id = ?";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, id);
                ResultSet rs = stmt.executeQuery();

                if (rs.next()) {
                    p = new Product();
                    p.setId(rs.getInt("id"));
                    p.setName(rs.getString("name"));
                    p.setDescription(rs.getString("description"));
                    p.setPrice(rs.getDouble("price"));
                    p.setImageUrl(rs.getString("imageUrl"));
                    p.setDiscount(rs.getFloat("discount"));
                    p.setCategory(rs.getString("category"));
                    p.setOccasion(rs.getString("occasion"));
                    p.setStock(rs.getInt("stock"));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (conn != null) {
                DatabaseConnection.returnConnection(conn);
            }
        }

        return p;
    }

    @Override
    public boolean addProduct(Product product) {
        String sql = "INSERT INTO products (name, description, price, imageUrl, discount, category, occasion, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, product.getName());
                stmt.setString(2, product.getDescription());
                stmt.setDouble(3, product.getPrice());
                stmt.setString(4, product.getImageUrl());
                stmt.setFloat(5, product.getDiscount());
                stmt.setString(6, product.getCategory());
                stmt.setString(7, product.getOccasion());
                stmt.setInt(8, product.getStock());

                return stmt.executeUpdate() > 0;
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (conn != null) {
                DatabaseConnection.returnConnection(conn);
            }
        }

        return false;
    }

    @Override
    public boolean updateProduct(Product product) {
        String sql = "UPDATE products SET name=?, description=?, price=?, imageUrl=?, discount=?, category=?, occasion=?, stock=? WHERE id=?";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, product.getName());
                stmt.setString(2, product.getDescription());
                stmt.setDouble(3, product.getPrice());
                stmt.setString(4, product.getImageUrl());
                stmt.setFloat(5, product.getDiscount());
                stmt.setString(6, product.getCategory());
                stmt.setString(7, product.getOccasion());
                stmt.setInt(8, product.getStock());
                stmt.setInt(9, product.getId());

                return stmt.executeUpdate() > 0;
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (conn != null) {
                DatabaseConnection.returnConnection(conn);
            }
        }

        return false;
    }
    
    public boolean decreaseStock(int productId, int quantity) {
        String sql = "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, quantity);
                stmt.setInt(2, productId);
                stmt.setInt(3, quantity);

                int rowsAffected = stmt.executeUpdate();
                return rowsAffected > 0;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        } finally {
            if (conn != null) {
                DatabaseConnection.returnConnection(conn);
            }
        }
    }

    @Override
    public boolean deleteProduct(int id) {
        String sql = "DELETE FROM products WHERE id=?";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, id);
                return stmt.executeUpdate() > 0;
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (conn != null) {
                DatabaseConnection.returnConnection(conn);
            }
        }

        return false;
    }
}
