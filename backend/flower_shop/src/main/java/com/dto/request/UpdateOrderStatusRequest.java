package com.dto.request;

public class UpdateOrderStatusRequest {
	private int orderId;
    private String status;

    // Getters và Setters
    public int getOrderId() {
        return orderId;
    }
    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
}
