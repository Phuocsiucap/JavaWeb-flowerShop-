package com.controller;

import com.model.Cart;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Servlet để xóa sản phẩm khỏi giỏ hàng
 */
@WebServlet("/api/cart/remove/*")
public class RemoveFromCartServlet extends CartController {
    private static final long serialVersionUID = 1L;
    
    @Override
    public void init() throws ServletException {
        super.init();
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            String pathInfo = request.getPathInfo();
            if (pathInfo == null || pathInfo.length() <= 1) {
                sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, "Thiếu Product ID để xóa.");
                return;
            }
            
            String productId = pathInfo.substring(1);
            HttpSession session = request.getSession();
            Cart cart = cartService.getOrCreateCart(session);
            
            cart = cartService.removeItemFromCart(cart, productId);
            sendSuccessResponse(response, cart);
        } catch (Exception e) {
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng: " + e.getMessage());
        }
    }
    
    // Hỗ trợ phương thức POST để xóa (cho các trình duyệt/client không hỗ trợ DELETE)
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doDelete(request, response);
    }
}