package com.model;

import java.util.ArrayList;
import java.util.List;

public class Cart {
    private int cartId;
    private double shippingFee = 30000; 
    private String userId;
    
	public Cart(int cartId, double shippingFee, String userId) {

		this.cartId = cartId;
		this.shippingFee = shippingFee;
		this.userId = userId;
	}

	public int getCartId() {
		return cartId;
	}

	public void setCartId(int cartId) {
		this.cartId = cartId;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public double getShippingFee() {
		return shippingFee;
	}

	public void setShippingFee(double shippingFee) {
		this.shippingFee = shippingFee;
	}


}