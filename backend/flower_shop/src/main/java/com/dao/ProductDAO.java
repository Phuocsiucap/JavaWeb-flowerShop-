package com.dao;

import com.model.Product;
import com.util.DatabaseConnection;

import java.sql.*;
import java.util.*;

public class ProductDAO {

    // Hàm lấy danh sách tất cả sản phẩm
    public List<Product> getAllProducts() {
        List<Product> list = new ArrayList<>();
        String sql = "SELECT * FROM products";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
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

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    // Hàm lấy chi tiết sản phẩm theo ID
    public Product getProductById(int id) {
        Product p = null;
        String sql = "SELECT * FROM products WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
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

        } catch (Exception e) {
            e.printStackTrace();
        }

        return p;
    }
}
