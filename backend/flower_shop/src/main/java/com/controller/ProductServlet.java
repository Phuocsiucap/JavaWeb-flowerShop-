package com.controller;


import com.dao.ProductDAO;
import com.google.gson.Gson;
import com.model.Product;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/products/*") // gọi products hoặc products/{id}
public class ProductServlet extends HttpServlet {
    private ProductDAO productDAO = new ProductDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String pathInfo = request.getPathInfo(); // phần sau /api/products

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        if (pathInfo == null || pathInfo.equals("/")) {
            // trả về toàn bộ sản phẩm
            List<Product> products = productDAO.getAllProducts();
            String json = new Gson().toJson(products);
            response.getWriter().write(json);
        } else {
            // trả về chi tiết sản phẩm
            try {
                int id = Integer.parseInt(pathInfo.substring(1)); // bỏ dấu "/"
                Product product = productDAO.getProductById(id);
                if (product != null) {
                    String json = new Gson().toJson(product);
                    response.getWriter().write(json);
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("{\"error\": \"Không tìm thấy sản phẩm\"}");
                }
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"ID không hợp lệ\"}");
            }
        }
    }
}

