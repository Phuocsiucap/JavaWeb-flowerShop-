package com.controller;

import java.io.IOException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import com.model.Order;
import com.model.OrderItem;
import com.dao.OrderDAO;
import java.util.ArrayList;

@WebServlet(name = "CheckoutServlet", urlPatterns = {"/checkout"})
public class CheckoutServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession();
        
        // Lấy giỏ hàng từ session
        List<OrderItem> cart = (List<OrderItem>) session.getAttribute("cart");
        
        // Nếu giỏ hàng trống, chuyển hướng về trang giỏ hàng
        if (cart == null || cart.isEmpty()) {
            response.sendRedirect("cart");
            return;
        }
        
        // Tính tổng tiền
        double totalAmount = 0;
        for (OrderItem item : cart) {
            totalAmount += item.getSubtotal();
        }
        
        // Lưu tổng tiền vào request để hiển thị
        request.setAttribute("totalAmount", totalAmount);
        request.setAttribute("cart", cart);
        
        // Chuyển hướng đến trang thanh toán
        request.getRequestDispatcher("/WEB-INF/views/checkout.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession();
        
        // Lấy thông tin từ form
        String shippingAddress = request.getParameter("shippingAddress");
        String phoneNumber = request.getParameter("phoneNumber");
        String paymentMethod = request.getParameter("paymentMethod");
        
        // Kiểm tra thông tin
        if (shippingAddress == null || shippingAddress.trim().isEmpty() || 
            phoneNumber == null || phoneNumber.trim().isEmpty() || 
            paymentMethod == null || paymentMethod.trim().isEmpty()) {
            
            request.setAttribute("errorMessage", "Vui lòng điền đầy đủ thông tin thanh toán");
            request.getRequestDispatcher("/WEB-INF/views/checkout.jsp").forward(request, response);
            return;
        }
        
        // Lấy thông tin người dùng từ session
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            response.sendRedirect("login");
            return;
        }
        
        // Lấy giỏ hàng từ session
        List<OrderItem> cart = (List<OrderItem>) session.getAttribute("cart");
        if (cart == null || cart.isEmpty()) {
            response.sendRedirect("cart");
            return;
        }
        
        // Tính tổng tiền
        double totalAmount = 0;
        for (OrderItem item : cart) {
            totalAmount += item.getSubtotal();
        }
        
        // Tạo đơn hàng mới
        Order order = new Order();
        order.setUserId(userId);
        order.setTotalAmount(totalAmount);
        order.setStatus("Pending");
        order.setPaymentMethod(paymentMethod);
        order.setShippingAddress(shippingAddress);
        order.setPhoneNumber(phoneNumber);
        order.setItems(cart);
        
        // Lưu đơn hàng vào database
        OrderDAO orderDAO = new OrderDAO();
        int orderId = orderDAO.createOrder(order);
        
        if (orderId > 0) {
            // Xóa giỏ hàng sau khi đặt hàng thành công
            session.removeAttribute("cart");
            
            // Chuyển hướng đến trang xử lý thanh toán
            response.sendRedirect("payment?orderId=" + orderId);
        } else {
            request.setAttribute("errorMessage", "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.");
            request.getRequestDispatcher("/WEB-INF/views/checkout.jsp").forward(request, response);
        }
    }
}