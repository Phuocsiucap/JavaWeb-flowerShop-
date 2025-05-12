package com.mapper;

import com.model.User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class UserMapper {
    public static Map<String, Object> toMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("email", user.getEmail());
        map.put("password", user.getPassword());
        map.put("name", user.getName());
        map.put("address", user.getAddress());
        map.put("phone", user.getPhone());
        map.put("role", user.getRole());
        map.put("status", user.getStatus());
        map.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        map.put("lastLogin", user.getLastLogin() != null ? user.getLastLogin().toString() : null);
        return map;
    }

    public static List<Map<String, Object>> toMapList(List<User> users) {
        return users.stream()
                .map(UserMapper::toMap)
                .collect(Collectors.toList());
    }
}
