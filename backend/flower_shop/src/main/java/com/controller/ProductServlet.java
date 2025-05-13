package com.controller;


import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.dao.ProductDAO;
import com.dao.ProductDAOImpl;
import com.dto.request.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.model.Product;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.file.Paths;
import java.util.Base64;
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
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Upload image to ImgBB and return image URL
    private String uploadToImgBB(Part filePart) throws IOException {
        String apiKey = "05a48fa961229de8126fbb5798d949fc"; 

        if (filePart == null || filePart.getSize() == 0) return null;

        InputStream inputStream = filePart.getInputStream();
        byte[] imageBytes = inputStream.readAllBytes();
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

        String url = "https://api.imgbb.com/1/upload?key=" + apiKey;
        String payload = "image=" + URLEncoder.encode(base64Image, "UTF-8");

        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

        try (OutputStream os = connection.getOutputStream()) {
            os.write(payload.getBytes());
        }

        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            StringBuilder responseBuilder = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    responseBuilder.append(line);
                }
            }

            JsonObject json = JsonParser.parseString(responseBuilder.toString()).getAsJsonObject();
            return json.getAsJsonObject("data").get("url").getAsString();
        }

        return null;
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
            float discount = Float.parseFloat(request.getParameter("discount"));
            String description = request.getParameter("description");
            String category = request.getParameter("category");
            String occasion = request.getParameter("occasion");
            int stock = Integer.parseInt(request.getParameter("stock"));

            String imageUrl = uploadToImgBB(request.getPart("image"));

            Product product = new Product();
            product.setName(name);
            product.setPrice(price);
            product.setDiscount(discount);
            product.setDescription(description);
            product.setCategory(category);
            product.setOccasion(occasion);
            product.setStock(stock);
            product.setImageUrl(imageUrl);
//            product.setName(name);
//            product.setPrice(price);
//            product.setDescription(description);
//            product.setImageUrl(imageUrl);

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
            float discount = Float.parseFloat(request.getParameter("discount"));
            String description = request.getParameter("description");
            String category = request.getParameter("category");
            String occasion = request.getParameter("occasion");
            int stock = Integer.parseInt(request.getParameter("stock"));

            String imageUrl = uploadToImgBB(request.getPart("image"));
            if (imageUrl == null) imageUrl = existingProduct.getImageUrl();
            else product.setImageUrl(imageUrl);
//
//            existingProduct.setName(name);
//            existingProduct.setPrice(price);
//            existingProduct.setDescription(description);
//            existingProduct.setImageUrl(imageUrl);

            existingProduct.setName(name);
            existingProduct.setPrice(price);
            existingProduct.setDiscount(discount);
            existingProduct.setDescription(description);
            existingProduct.setCategory(category);
            existingProduct.setOccasion(occasion);
            existingProduct.setStock(stock);
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
