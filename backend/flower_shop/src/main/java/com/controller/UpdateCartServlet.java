package com.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.model.Cart;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Map;

/**
 * Servlet để cập nhật số lượng sản phẩm trong giỏ hàng
 */
@WebServlet("/api/cart/update")
public class UpdateCartServlet extends CartController {
    private static final long serialVersionUID = 1L;
    
    @Override
    public void init() throws ServletException {
        super.init();
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            HttpSession session = request.getSession();
            Cart cart = cartService.getOrCreateCart(session);
            Map<String, Object> updateData = objectMapper.readValue(
                request.getReader(),
                new TypeReference<Map<String, Object>>() {}
            );
            
            String productId = (String) updateData.get("productId");
            int quantity = ((Number) updateData.get("quantity")).intValue();
            
            cart = cartService.updateItemQuantity(cart, productId, quantity);
            sendSuccessResponse(response, cart);
        } catch (Exception e) {
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Có lỗi xảy ra khi cập nhật giỏ hàng: " + e.getMessage());
        }
    }
}