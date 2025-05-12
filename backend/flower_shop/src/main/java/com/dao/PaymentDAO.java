package com.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import com.model.Payment;
import com.util.DatabaseConnection;

public class PaymentDAO {

    public void savePayment(Payment payment) throws SQLException {
        String sql = "INSERT INTO payment (method, credit_card_name, credit_card_number, credit_card_expiry, credit_card_cvv, orderId) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, payment.getMethod());
            stmt.setString(2, payment.getCreditCardName());
            stmt.setString(3, payment.getCreditCardNumber());
            stmt.setString(4, payment.getCreditCardExpiry());
            stmt.setString(5, payment.getCreditCardCVV());
            stmt.setInt(6, payment.getOrderId());

            stmt.executeUpdate();
        }
    }
}
