package com.dao;

import com.model.Product;
import java.util.List;

public interface ProductDAO {
	List<Product> getAllProducts();
    Product getProductById(int id);
    boolean addProduct(Product product);
    boolean updateProduct(Product product, Product newInfo);
    boolean deleteProduct(int id);
}
