package com.dto.response;

import java.util.HashMap;
import java.util.Map;

public class ApiResponse {
    private boolean success;
    private String message;
    private Map<String, Object> data;
    
    private ApiResponse(boolean success, String message, Map<String, Object> data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public Map<String, Object> getData() {
        return data;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private boolean success;
        private String message;
        private Map<String, Object> data = new HashMap<>();
        
        public Builder success(boolean success) {
            this.success = success;
            return this;
        }
        
        public Builder message(String message) {
            this.message = message;
            return this;
        }
        
        public Builder data(Map<String, Object> data) {
            this.data = data;
            return this;
        }
        
        public ApiResponse build() {
            return new ApiResponse(success, message, data);
        }
    }
}