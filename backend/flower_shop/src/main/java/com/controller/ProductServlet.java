package com.controller;

import com.google.gson.Gson;
import com.dao.ProductDAO;
import com.dao.ProductDAOImpl;
import com.model.Product;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.List;

@WebServlet("/products/*")
public class ProductServlet extends HttpServlet {
    private final ProductDAO productDAO = new ProductDAOImpl();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String pathInfo = request.getPathInfo();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        // xem tất cả sp
        if (pathInfo == null || pathInfo.equals("/")) {
            List<Product> products = productDAO.getAllProducts();
            String json = gson.toJson(products);
            response.getWriter().write(json);
        } else {
        	// xem chi tiết sp
            try {
                int id = Integer.parseInt(pathInfo.substring(1));
                Product product = productDAO.getProductById(id);
                if (product != null) {
                    String json = gson.toJson(product);
                    response.getWriter().write(json);
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("Không tìm thấy sản phẩm");
                }
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("ID không hợp lệ");
            }
        }
    }

    // Thêm sản phẩm 
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Product product = gson.fromJson(request.getReader(), Product.class);
        boolean success = productDAO.addProduct(product);

        if (success) {
            response.setStatus(HttpServletResponse.SC_CREATED);
            response.getWriter().write("Sản phẩm đã được thêm");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Không thêm được sản phẩm");
        }
    }

    // Sửa sản phẩm 
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Product product = gson.fromJson(request.getReader(), Product.class);
        boolean success = productDAO.updateProduct(product);

        if (success) {
            response.getWriter().write("Cập nhật sản phẩm thành công");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Không cập nhật được sản phẩm");
        }
    }

    // Xoá sản phẩm 
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        try {
            int id = Integer.parseInt(pathInfo.substring(1));
            boolean success = productDAO.deleteProduct(id);
            if (success) {
                response.getWriter().write("Xoá sản phẩm thành công");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("Không tìm thấy sản phẩm để xoá");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("ID không hợp lệ");
        }
    }
}
