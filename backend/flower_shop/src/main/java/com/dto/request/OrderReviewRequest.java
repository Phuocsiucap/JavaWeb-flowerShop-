package com.dto.request;

public class OrderReviewRequest {
    private String name;
    private String email;
    private int overallRating;
    private int deliveryRating;
    private int packagingRating;
    private String comment;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(int overallRating) {
        this.overallRating = overallRating;
    }

    public int getDeliveryRating() {
        return deliveryRating;
    }

    public void setDeliveryRating(int deliveryRating) {
        this.deliveryRating = deliveryRating;
    }

    public int getPackagingRating() {
        return packagingRating;
    }

    public void setPackagingRating(int packagingRating) {
        this.packagingRating = packagingRating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
