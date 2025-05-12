package com.model;

import lombok.*;

@Data
@Builder
public class User {

    private String id;
    private String email;
    private String password;
    private String role;
    private String name;
    private String address;
    private String phone;

    public User(String id, String email, String password, String role, String name, String address, String phone) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.name = name;
        this.address = address;
        this.phone = phone;
    }

    public User() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}