package com.util;
// JwtUtil.java
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.model.User;

import java.util.Date;

public class JwtUtil {
    private static final String SECRET_KEY = "skaldjgflajshfiaufbKNZB.sadhad/adfahdfia0afakja3242_jkahdfk";
    private static final long EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 1 ngày

    public static String generateToken(User user) {
    	System.out.println("Generating token for role: " + user.getRole());
        return JWT.create()
                .withSubject(user.getId())
                .withClaim("email", user.getEmail())
                .withClaim("role", user.getRole())
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .sign(Algorithm.HMAC256(SECRET_KEY));
    }

    public static DecodedJWT verifyToken(String token) {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(SECRET_KEY)).build();
        return verifier.verify(token);
    }
}



//xây dựng jwt thuần
/*
* package com.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;

public class JwtUtil {

    private static final String SECRET_KEY = "your_secret_key";

    public static String generateToken(String email, long expirationMillis) {
        long exp = System.currentTimeMillis() + expirationMillis;

        String header = base64UrlEncode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = base64UrlEncode("{\"email\":\"" + email + "\",\"exp\":" + exp + "}");

        String signature = hmacSha256(header + "." + payload, SECRET_KEY);

        return header + "." + payload + "." + signature;
    }

    public static boolean isTokenValid(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) return false;

        String header = parts[0];
        String payload = parts[1];
        String signature = parts[2];

        String expectedSignature = hmacSha256(header + "." + payload, SECRET_KEY);
        if (!expectedSignature.equals(signature)) return false;

        String jsonPayload = new String(Base64.getUrlDecoder().decode(payload), StandardCharsets.UTF_8);
        long exp = Long.parseLong(jsonPayload.replaceAll(".*\"exp\":(\\d+).*", "$1"));

        return System.currentTimeMillis() < exp;
    }

    private static String base64UrlEncode(String str) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(str.getBytes(StandardCharsets.UTF_8));
    }

    private static String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HMACSHA256", e);
        }
    }
}
*/