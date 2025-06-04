package com.dto.request;

public class TopCustomerDTO {
    private String name;
    private String email;
    private double totalAmount;

    public TopCustomerDTO() {}
    public TopCustomerDTO(String name, String email, double totalAmount) {
        this.name = name;
        this.email = email;
        this.totalAmount = totalAmount;
    }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
}
