package com.dto.request;

public class RevenueDTO {
    private String date;
    private Double revenue;

    public RevenueDTO() {}

    public RevenueDTO(String date, Double revenue) {
        this.date = date;
        this.revenue = revenue;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public Double getRevenue() { return revenue; }
    public void setRevenue(Double revenue) { this.revenue = revenue; }
}