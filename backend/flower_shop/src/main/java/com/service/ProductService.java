package com.service;

import com.dao.ProductDAO;
import com.model.Product;

import java.sql.SQLException;
import java.util.List;

public class ProductService {
    private ProductDAO productDAO;
    
    public ProductService() {
        this.productDAO = new ProductDAO();
    }
    
    public List<Product> getAllProducts() throws SQLException {
        return productDAO.getAllProducts();
    }
    
    public Product getProductById(int id) throws SQLException {
        return productDAO.getProductById(id);
    }
}