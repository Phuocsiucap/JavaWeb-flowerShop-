package com.controller;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import com.model.Order;
import com.model.Payment;
import com.dao.OrderDAO;
import com.dao.PaymentDAO;
import java.util.UUID;

@WebServlet(name = "PaymentServlet", urlPatterns = {"/payment"})
public class PaymentServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Lấy orderID từ request
        String orderIdParam = request.getParameter("orderId");
        
        if (orderIdParam == null || orderIdParam.trim().isEmpty()) {
            response.sendRedirect("home");
            return;
        }
        
        try {
            int orderId = Integer.parseInt(orderIdParam);
            
            // Kiểm tra xem người dùng đã đăng nhập chưa
            HttpSession session = request.getSession();
            Integer userId = (Integer) session.getAttribute("userId");
            
            if (userId == null) {
                response.sendRedirect("login");
                return;
            }
            
            // Lấy thông tin đơn hàng
            OrderDAO orderDAO = new OrderDAO();
            Order order = orderDAO.getOrderById(orderId);
            
            if (order == null) {
                response.sendRedirect("orders");
                return;
            }
            
            // Kiểm tra đơn hàng có thuộc về người dùng không
            if (order.getUserId() != userId) {
                response.sendRedirect("orders");
                return;
            }
            
            // Đưa thông tin đơn hàng vào request
            request.setAttribute("order", order);
            
            // Chuyển hướng đến trang thanh toán tương ứng với phương thức thanh toán
            String paymentMethod = order.getPaymentMethod();
            
            switch (paymentMethod) {
                case "Cash":
                    request.getRequestDispatcher("/WEB-INF/views/payment/cash_payment.jsp").forward(request, response);
                    break;
                case "Credit Card":
                    request.getRequestDispatcher("/WEB-INF/views/payment/credit_card_payment.jsp").forward(request, response);
                    break;
                case "Banking":
                    request.getRequestDispatcher("/WEB-INF/views/payment/banking_payment.jsp").forward(request, response);
                    break;
                default:
                    request.getRequestDispatcher("/WEB-INF/views/payment/payment.jsp").forward(request, response);
                    break;
            }
            
        } catch (NumberFormatException e) {
            response.sendRedirect("home");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Lấy thông tin từ form
        String orderIdParam = request.getParameter("orderId");
        String paymentMethod = request.getParameter("paymentMethod");
        
        // Các thông tin thanh toán khác (tùy thuộc vào phương thức thanh toán)
        String cardNumber = request.getParameter("cardNumber");
        String cardHolder = request.getParameter("cardHolder");
        String expiryDate = request.getParameter("expiryDate");
        String cvv = request.getParameter("cvv");
        
        String bankAccount = request.getParameter("bankAccount");
        String bankName = request.getParameter("bankName");
        
        try {
            int orderId = Integer.parseInt(orderIdParam);
            
            // Lấy thông tin đơn hàng
            OrderDAO orderDAO = new OrderDAO();
            Order order = orderDAO.getOrderById(orderId);
            
            if (order == null) {
                request.setAttribute("errorMessage", "Không tìm thấy đơn hàng");
                request.getRequestDispatcher("/WEB-INF/views/payment/payment_error.jsp").forward(request, response);
                return;
            }
            
            // Tạo một ID giao dịch ngẫu nhiên
            String transactionId = UUID.randomUUID().toString();
            
            // Tạo thông tin thanh toán
            Payment payment = new Payment();
            payment.setOrderId(orderId);
            payment.setAmount(order.getTotalAmount());
            payment.setPaymentMethod(paymentMethod);
            payment.setTransactionId(transactionId);
            payment.setStatus("Success"); // Mặc định là thành công (trong thực tế sẽ tích hợp với cổng thanh toán)
            
            // Lưu thông tin thanh toán vào database
            PaymentDAO paymentDAO = new PaymentDAO();
            int paymentId = paymentDAO.createPayment(payment);
            
            if (paymentId > 0) {
                // Cập nhật trạng thái đơn hàng
                orderDAO.updateOrderStatus(orderId, "Paid");
                
                // Chuyển hướng đến trang xác nhận thanh toán thành công
                response.sendRedirect("payment-success?orderId=" + orderId);
            } else {
                request.setAttribute("errorMessage", "Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại.");
                request.getRequestDispatcher("/WEB-INF/views/payment/payment_error.jsp").forward(request, response);
            }
            
        } catch (NumberFormatException e) {
            request.setAttribute("errorMessage", "Thông tin không hợp lệ");
            request.getRequestDispatcher("/WEB-INF/views/payment/payment_error.jsp").forward(request, response);
        }
    }
}