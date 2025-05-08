package com.dto.response;

import java.util.Objects;

public class AuthResponse {
    private String message;
    private Object data;

    // Constructor mặc định
    public AuthResponse() {}

    // Constructor đầy đủ
    public AuthResponse(String message, Object data) {
        this.message = message;
        this.data = data;
    }

    // Getter cho message
    public String getMessage() {
        return message;
    }

    // Getter cho data
    public Object getData() {
        return data;
    }

    // Builder method
    public static Builder builder() {
        return new Builder();
    }

    // Builder class
    public static class Builder {
        private String message;
        private Object data;

        // Setters với method chaining
        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder data(Object data) {
            this.data = data;
            return this;
        }

        // Phương thức build() để trả về đối tượng AuthResponse
        public AuthResponse build() {
            return new AuthResponse(message, data);
        }
    }

    // Override các phương thức toString, equals và hashCode nếu cần
    @Override
    public String toString() {
        return "AuthResponse{" +
                "message='" + message + '\'' +
                ", data=" + data +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AuthResponse)) return false;
        AuthResponse that = (AuthResponse) o;
        return Objects.equals(message, that.message) && Objects.equals(data, that.data);
    }

    @Override
    public int hashCode() {
        return Objects.hash(message, data);
    }
}
