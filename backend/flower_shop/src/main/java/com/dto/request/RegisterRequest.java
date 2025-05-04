package com.dto.request;

public class RegisterRequest {
    private String email;
    private String password;
    private String name;



    public RegisterRequest() {
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public void setName(String username) {
        this.name = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
