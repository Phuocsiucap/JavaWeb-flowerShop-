package com.controller;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.*;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.*;

@WebServlet("/images/*")
public class ImageServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String filename = request.getPathInfo();

        if (filename == null || filename.equals("/") || filename.contains("..")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Tên tệp không hợp lệ");
            return;
        }

        filename = filename.substring(1); // Bỏ dấu "/"

        // Đường dẫn tuyệt đối đến thư mục "images"
        String imageDir = "E:\\JavaWeb-flowerShop-\\JavaWeb-flowerShop-\\backend\\flower_shop\\images";
        
        Path filePath = Paths.get(imageDir, filename);
        File file = filePath.toFile();

        if (!file.exists() || !file.isFile()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.getWriter().write("Không tìm thấy ảnh");
            return;
        }

        String mimeType = getServletContext().getMimeType(file.getAbsolutePath());
        if (mimeType == null) {
            mimeType = "application/octet-stream";
        }

        response.setContentType(mimeType);
        response.setContentLengthLong(file.length());
        response.setHeader("Content-Disposition", "inline; filename=\"" + file.getName() + "\"");

        try (InputStream in = new FileInputStream(file); OutputStream out = response.getOutputStream()) {
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
    }
}
