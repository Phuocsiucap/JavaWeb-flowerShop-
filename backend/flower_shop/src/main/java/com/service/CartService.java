package com.service;

import com.model.Cart;
import com.dao.CartDAO;

import java.util.Optional;

public class CartService {
    private final CartDAO cartDAO = new CartDAO();

    public Cart getOrCreateCart(String userId) {
        Optional<Cart> cartOptional = cartDAO.findByUserID(userId);
        if (cartOptional.isPresent()) {
            return cartOptional.get();
        } else {
            // Tạo Cart mới, cartId sẽ được sinh tự động bởi database
            Cart newCart = new Cart(0, 30000, userId); // cartId = 0, sẽ được thay bởi AUTO_INCREMENT
            int generatedCartId = cartDAO.save(newCart);
            newCart.setCartId(generatedCartId);
            return newCart;
        }
    }
}