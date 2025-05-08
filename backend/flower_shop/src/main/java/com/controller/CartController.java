package com.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.service.CartService;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


/**
 * Đây chỉ là lớp cơ sở chứa các phương thức tiện ích chung cho các controller giỏ hàng
 */
public abstract class CartController extends HttpServlet {
	private static final long serialVersionUID = 1L;
	protected CartService cartService;
    protected ObjectMapper objectMapper;
    
    @Override
    public void init() throws ServletException {
        super.init();
        cartService = new CartService();
        objectMapper = new ObjectMapper();
    }
    
    protected void sendSuccessResponse(HttpServletResponse response, Object data) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(data));
    }
    
    protected void sendErrorResponse(HttpServletResponse response, int statusCode, String message) throws IOException {
        response.setStatus(statusCode);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(String.format("{\"error\": \"%s\"}", message));
    }
}