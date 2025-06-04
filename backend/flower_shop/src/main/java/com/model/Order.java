package com.model;

import java.util.Date;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

public class Order {
    private int orderId;
    private String userId;
    private Date orderDate;
    private double totalAmount;
    private String status; // Pending, Paid, Cancelled
    private String paymentMethod; // Cash, Credit Card, Banking
    private List<OrderItem> items;
    private String shippingAddress;
    private String phoneNumber;

    public Order() {
    	this.items = Collections.synchronizedList(new ArrayList<>());
        this.orderDate = new Date();
        this.status = "Pending";
    }

    public Order(int orderId, String userId, double totalAmount, String paymentMethod, String shippingAddress, String phoneNumber) {
        this.orderId = orderId;
        this.userId = userId;
        this.orderDate = new Date();
        this.totalAmount = totalAmount;
        this.status = "Pending";
        this.paymentMethod = paymentMethod;
        this.items = new ArrayList<>();
        this.shippingAddress = shippingAddress;
        this.phoneNumber = phoneNumber;
    }

    // Getters and Setters
    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }
    
    public void addItem(OrderItem item) {
        this.items.add(item);
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}