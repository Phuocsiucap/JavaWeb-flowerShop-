package com.controller;

import com.dao.ProductDAO;
import com.dao.ProductDAOImpl;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.FileContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.Permission;
import com.google.gson.Gson;
import com.model.Product;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.*;
import java.nio.file.Paths;
import java.util.Collections;
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

    // Lấy Drive service từ credentials.json
    private Drive getDriveService() throws IOException {
        GoogleCredential credential = GoogleCredential.fromStream(
            getServletContext().getResourceAsStream("/WEB-INF/flowershop-460508-df16ca139d1e.json")
        ).createScoped(Collections.singleton(DriveScopes.DRIVE));

        return new Drive.Builder(
            new com.google.api.client.http.javanet.NetHttpTransport(),
            com.google.api.client.json.jackson2.JacksonFactory.getDefaultInstance(),
            credential
        ).setApplicationName("ProductApp").build();
    }

    // Upload ảnh lên Google Drive
    private String uploadToDrive(Part filePart) throws IOException {
        if (filePart == null || filePart.getSize() == 0) return null;

        String fileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
        java.io.File tempFile = java.io.File.createTempFile("upload-", fileName);
        try (InputStream input = filePart.getInputStream();
             OutputStream output = new FileOutputStream(tempFile)) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = input.read(buffer)) != -1) {
                output.write(buffer, 0, bytesRead);
            }
        }

        Drive driveService = getDriveService();

        File fileMetadata = new File();
        fileMetadata.setName(fileName);

        
        String folderId = "12ubEBc-FutgG4UWhSEzazxVCLuOvRaWW";
        fileMetadata.setParents(Collections.singletonList(folderId));

        FileContent mediaContent = new FileContent(filePart.getContentType(), tempFile);
        File uploadedFile = driveService.files().create(fileMetadata, mediaContent)
            .setFields("id").execute();

        // Cho phép xem công khai qua link
        Permission permission = new Permission()
            .setType("anyone")
            .setRole("reader");
        driveService.permissions().create(uploadedFile.getId(), permission).execute();
        
     // Xoá file tạm sau khi upload
        tempFile.delete();
        
        return "https://drive.google.com/thumbnail?id=" + uploadedFile.getId();
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

            String imageUrl = uploadToDrive(request.getPart("image"));

            Product product = new Product();
            product.setName(name);
            product.setPrice(price);
            product.setDiscount(discount);
            product.setDescription(description);
            product.setCategory(category);
            product.setOccasion(occasion);
            product.setStock(stock);
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
            float discount = Float.parseFloat(request.getParameter("discount"));
            String description = request.getParameter("description");
            String category = request.getParameter("category");
            String occasion = request.getParameter("occasion");
            int stock = Integer.parseInt(request.getParameter("stock"));

            String imageUrl = uploadToDrive(request.getPart("image"));
            if (imageUrl == null) imageUrl = existingProduct.getImageUrl();

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
