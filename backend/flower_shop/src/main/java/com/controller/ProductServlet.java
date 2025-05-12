package com.controller;

import com.google.gson.Gson;
import com.dao.ProductDAO;
import com.dao.ProductDAOImpl;
import com.model.Product;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;

@WebServlet("/products/*")
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024, // 1MB
    maxFileSize = 1024 * 1024 * 5,   // 5MB
    maxRequestSize = 1024 * 1024 * 10
)
public class ProductServlet extends HttpServlet {
    private final ProductDAO productDAO = new ProductDAOImpl();
    private final Gson gson = new Gson();

    private String saveImage(Part filePart) throws IOException {
        if (filePart == null || filePart.getSize() == 0) return null;

        String imageDir = "E:\\JavaWeb-flowerShop-\\JavaWeb-flowerShop-\\backend\\flower_shop\\images";
        File dir = new File(imageDir);
        if (!dir.exists()) dir.mkdirs();

        String fileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
        String savedPath = imageDir + File.separator + fileName;
        filePart.write(savedPath);

        // Trả về đường dẫn URL tương đối để client truy cập được
        return "/images/" + fileName;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            List<Product> products = productDAO.getAllProducts();
            response.getWriter().write(gson.toJson(products));
        } else {
            try {
                int id = Integer.parseInt(pathInfo.substring(1));
                Product product = productDAO.getProductById(id);
                if (product != null) {
                    response.getWriter().write(gson.toJson(product));
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

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String name = request.getParameter("name");
            double price = Double.parseDouble(request.getParameter("price"));
            String description = request.getParameter("description");

            String imageUrl = saveImage(request.getPart("image"));

            Product product = new Product();
            product.setName(name);
            product.setPrice(price);
            product.setDescription(description);
            product.setImageUrl(imageUrl);

            boolean success = productDAO.addProduct(product);
            if (success) {
                response.setStatus(HttpServletResponse.SC_CREATED);
                response.getWriter().write("{\"message\": \"Sản phẩm đã được thêm\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"error\": \"Không thêm được sản phẩm\"}");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Dữ liệu không hợp lệ hoặc thiếu\"}");
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            int id = Integer.parseInt(request.getParameter("id"));
            Product existingProduct = productDAO.getProductById(id);

            if (existingProduct == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"error\": \"Không tìm thấy sản phẩm\"}");
                return;
            }

            String name = request.getParameter("name");
            double price = Double.parseDouble(request.getParameter("price"));
            String description = request.getParameter("description");

            String imageUrl = saveImage(request.getPart("image"));
            if (imageUrl == null) imageUrl = existingProduct.getImageUrl();

            existingProduct.setName(name);
            existingProduct.setPrice(price);
            existingProduct.setDescription(description);
            existingProduct.setImageUrl(imageUrl);

            boolean success = productDAO.updateProduct(existingProduct);
            if (success) {
                response.getWriter().write("{\"message\": \"Cập nhật sản phẩm thành công\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"error\": \"Không cập nhật được sản phẩm\"}");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Dữ liệu không hợp lệ hoặc thiếu\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String pathInfo = request.getPathInfo();
        try {
            int id = Integer.parseInt(pathInfo.substring(1));
            boolean success = productDAO.deleteProduct(id);
            if (success) {
                response.getWriter().write("{\"message\": \"Xoá sản phẩm thành công\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"error\": \"Không tìm thấy sản phẩm để xoá\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"ID không hợp lệ\"}");
        }
    }
}
