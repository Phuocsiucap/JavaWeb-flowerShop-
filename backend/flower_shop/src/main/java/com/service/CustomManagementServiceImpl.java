package com.service;

import com.dao.UserDao;
import com.dto.request.UserSearchRequest;
import com.model.User;
import com.util.JwtUtil;
import com.util.PasswordUtil;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

public class CustomManagementServiceImpl implements CustomManagementService {
    private final UserDao userDao;

    public CustomManagementServiceImpl(UserDao userDao) {
        this.userDao = userDao;
    }

    

    @Override
    public List<User> getUsers(UserSearchRequest searchRequest) {
        List<User> allUsers = userDao.findAll();
       

        // Nếu không có bộ lọc nào, trả toàn bộ danh sách
        if (searchRequest == null || (
                (searchRequest.getSearchTerm() == null || searchRequest.getSearchTerm().isEmpty()) &&
                (searchRequest.getRole() == null || searchRequest.getRole().isEmpty()) &&
                (searchRequest.getStatus() == null || searchRequest.getStatus().isEmpty()))) {
            return allUsers;
        }
        System.out.println(allUsers);
        System.out.println("cbiLoc");
        return allUsers.stream()
            .filter(user -> {
                boolean matches = true;

                // Lọc theo searchTerm (name, email, phone)
                if (searchRequest.getSearchTerm() != null && !searchRequest.getSearchTerm().isEmpty()) {
                    String searchTerm = searchRequest.getSearchTerm().toLowerCase();
                    boolean matchesSearch = false;

                    if (user.getName() != null && user.getName().toLowerCase().contains(searchTerm)) {
                        matchesSearch = true;
                    } else if (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchTerm)) {
                        matchesSearch = true;
                    } else if (user.getPhone() != null && user.getPhone().contains(searchTerm)) {
                        matchesSearch = true;
                    }

                    matches = matches && matchesSearch;
                }

                // Lọc theo role
                if (searchRequest.getRole() != null && !searchRequest.getRole().equals("all")) {
                    matches = matches && searchRequest.getRole().equals(user.getRole());
                }
                System.out.println("success2");
                System.out.println("success2");
                // Lọc theo status nếu có (chưa có trong model hiện tại)
                // Ví dụ: matches = matches && searchRequest.getStatus().equals(user.getStatus());

                return matches;
            })
            .collect(Collectors.toList());
    }

    @Override
    public Optional<User> getUserById(String userId) {
        return userDao.findById(userId);
    }

    @Override
    public User createUser(User user) {
       

        // Hash password nếu chưa hash
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(PasswordUtil.hashPassword(user.getPassword()));
        }

        return userDao.save(user);
    }

    @Override
    public boolean updateUser(User user) {
        Optional<User> existingUser = userDao.findById(user.getId());
        if (existingUser.isEmpty()) {
            return false;
        }

        User mergedUser = existingUser.get();

        // Cập nhật các field
        if (user.getName() != null) mergedUser.setName(user.getName());
        if (user.getEmail() != null) mergedUser.setEmail(user.getEmail());
        if (user.getPhone() != null) mergedUser.setPhone(user.getPhone());
        if (user.getAddress() != null) mergedUser.setAddress(user.getAddress());
        if (user.getRole() != null) mergedUser.setRole(user.getRole());
        if (user.getStatus() != null) mergedUser.setStatus(user.getStatus());

        // Cập nhật mật khẩu nếu có
        if (user.getPassword() != null && !user.getPassword().isEmpty() &&
                !user.getPassword().startsWith("$2a$")) {
            userDao.updatePassword(user.getId(), PasswordUtil.hashPassword(user.getPassword()));
        }

        try {
            userDao.update(mergedUser);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean deleteUser(String userId) {
        return userDao.deleteById(userId);
    }
}
