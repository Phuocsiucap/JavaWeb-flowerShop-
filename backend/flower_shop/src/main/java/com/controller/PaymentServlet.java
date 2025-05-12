package com.controller;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;

import java.io.IOException;

import javax.servlet.http.HttpServlet;

import com.dao.PaymentDAO;
import com.model.Payment;

@WebServlet("/payment")
public class PaymentServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String method = request.getParameter("method");
        int orderId = Integer.parseInt(request.getParameter("orderId"));

        Payment payment = new Payment();
        payment.setMethod(method);
        payment.setOrderId(orderId);

        if ("creditCard".equals(method)) {
            payment.setCreditCardName(request.getParameter("cardName"));
            payment.setCreditCardNumber(request.getParameter("cardNumber"));
            payment.setCreditCardExpiry(request.getParameter("cardExpiry"));
            payment.setCreditCardCVV(request.getParameter("cardCVV"));
        }

        // ATM thì không cần nhập thông tin thẻ, nhưng có thể xử lý QR riêng ở client

        try {
            PaymentDAO dao = new PaymentDAO();
            dao.savePayment(payment);
            response.sendRedirect("payment_success.jsp");
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("payment_error.jsp");
        }
    }
}
