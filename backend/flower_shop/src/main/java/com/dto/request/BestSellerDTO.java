package com.dto.request;

public class BestSellerDTO {
    private String productName;
    private int totalQuantity;

    public BestSellerDTO() {}
    public BestSellerDTO(String productName, int totalQuantity) {
        this.productName = productName;
        this.totalQuantity = totalQuantity;
    }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public int getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; }
}
