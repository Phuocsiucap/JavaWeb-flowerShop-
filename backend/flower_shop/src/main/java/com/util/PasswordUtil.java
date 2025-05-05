package com.util;


import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {

    // Mã hóa mật khẩu (hash)
    public static String hashPassword(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(12)); // độ mạnh: 12
    }

    // So sánh mật khẩu người dùng nhập với hash trong DB
    public static boolean checkPassword(String plainPassword, String hashedPassword) {
        if (plainPassword == null || hashedPassword == null) {
            return false;
        }
        return BCrypt.checkpw(plainPassword, hashedPassword);
    }
}
