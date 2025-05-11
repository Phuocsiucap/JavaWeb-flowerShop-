package com.dto.request;

public class UserSearchRequest {
    private String searchTerm;  // For searching by name, email, or phone
    private String role;    // For filtering by user type (role)
    private String status;      // For filtering by status (active, inactive, blocked)
    
    public UserSearchRequest() {
        // Default constructor
    }

    public String getSearchTerm() {
        return searchTerm;
    }

    public void setSearchTerm(String searchTerm) {
        this.searchTerm = searchTerm;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}