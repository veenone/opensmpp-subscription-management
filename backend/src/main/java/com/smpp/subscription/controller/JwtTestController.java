package com.smpp.subscription.controller;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class JwtTestController {
    
    @Value("${app.security.jwt.secret:smpp-subscription-management-secret-key-for-development-only-with-sufficient-length-384bits}")
    private String jwtSecret;
    
    @Value("${app.security.jwt.expiration:3600000}")
    private long jwtExpiration;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    
    @GetMapping("/jwt")
    public Map<String, Object> generateTestJwt() {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "1");
        claims.put("username", "testuser");
        claims.put("email", "test@example.com");
        claims.put("firstName", "Test");
        claims.put("lastName", "User");
        claims.put("active", true);
        
        String token = Jwts.builder()
                .claims(claims)
                .subject("1")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
        
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", token);
        response.put("tokenType", "Bearer");
        response.put("expiresIn", 3600L);
        response.put("message", "JWT token generated successfully");
        
        return response;
    }
}