package com.smpp.subscription.service;

import com.smpp.subscription.dto.AuthRequest;
import com.smpp.subscription.dto.AuthResponse;
import com.smpp.subscription.dto.RegisterRequest;
import com.smpp.subscription.entity.User;
import com.smpp.subscription.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Value("${app.security.jwt.secret:smpp-subscription-management-secret-key-for-development-only-with-sufficient-length-384bits}")
    private String jwtSecret;
    
    @Value("${app.security.jwt.expiration:3600000}") // 1 hour in milliseconds
    private long jwtExpiration;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setActive(true);
        user.setLocked(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        user = userRepository.save(user);

        // Generate JWT tokens
        String accessToken = generateToken(user);
        String refreshToken = generateRefreshToken();

        return AuthResponse.builder()
                .user(user)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(3600L) // 1 hour
                .tokenType("Bearer")
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        logger.info("DEBUG: Attempting login for username: " + request.getUsername());
        User user;
        try {
            user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
            logger.info("DEBUG: Successfully loaded user from database");
        } catch (Exception e) {
            logger.error("DEBUG: Error loading user: " + e.getMessage(), e);
            throw new RuntimeException("Invalid credentials");
        }
        
        logger.info("DEBUG: Found user: " + user.getUsername() + ", password hash: " + user.getPassword().substring(0, 20) + "...");
        logger.info("DEBUG: Input password: " + request.getPassword());
        logger.info("DEBUG: User active: " + user.isActive() + ", locked: " + user.isLocked());
        logger.info("DEBUG: User enabled: " + user.isEnabled() + ", credentials non-expired: " + user.isCredentialsNonExpired());
        
        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        logger.info("DEBUG: Password matches: " + passwordMatches);
        
        if (!passwordMatches) {
            logger.error("DEBUG: Password match failed - throwing Invalid credentials exception");
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is not active");
        }

        if (user.isLocked()) {
            throw new RuntimeException("Account is locked");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT tokens
        String accessToken = generateToken(user);
        String refreshToken = generateRefreshToken();

        return AuthResponse.builder()
                .user(user)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(3600L) // 1 hour
                .tokenType("Bearer")
                .build();
    }

    public void logout(String token) {
        // In a real implementation, invalidate the token
        // For now, this is handled on the client side
    }

    public User getCurrentUser(String token) {
        // In a real implementation, validate token and get user
        // For now, return a mock user
        return userRepository.findById(1L).orElse(null);
    }

    public AuthResponse refreshToken(String refreshToken) {
        // In a real implementation, validate refresh token and get user
        // For now, get a user from database (you should validate refresh token first)
        User user = userRepository.findById(1L).orElseThrow(() -> new RuntimeException("User not found"));
        String newAccessToken = generateToken(user);
        
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .expiresIn(3600L)
                .tokenType("Bearer")
                .build();
    }

    private String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", user.getId().toString());
        claims.put("username", user.getUsername());
        claims.put("email", user.getEmail());
        claims.put("firstName", user.getFirstName());
        claims.put("lastName", user.getLastName());
        claims.put("active", user.isActive());
        
        return Jwts.builder()
                .claims(claims)
                .subject(user.getId().toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }
    
    private String generateRefreshToken() {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (jwtExpiration * 24 * 7)); // 7 days
        
        return Jwts.builder()
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }
    
    public String generatePasswordHash(String password) {
        return passwordEncoder.encode(password);
    }
    
    public String fixAdminPassword() {
        logger.info("DEBUG: Attempting to fix admin user password");
        
        User adminUser = userRepository.findByUsername("admin")
            .orElseThrow(() -> new RuntimeException("Admin user not found"));
            
        logger.info("DEBUG: Found admin user, current password hash: " + adminUser.getPassword());
        
        // Generate a new BCrypt hash for "password"
        String newPasswordHash = passwordEncoder.encode("password");
        logger.info("DEBUG: Generated new password hash: " + newPasswordHash);
        
        // Update the admin user's password
        adminUser.setPassword(newPasswordHash);
        adminUser.setUpdatedAt(LocalDateTime.now());
        adminUser.setUpdatedBy("AUTH_SERVICE_FIX");
        
        userRepository.save(adminUser);
        logger.info("DEBUG: Successfully updated admin user password");
        
        // Verify the update worked by testing password matching
        boolean verificationResult = passwordEncoder.matches("password", newPasswordHash);
        logger.info("DEBUG: Password verification test result: " + verificationResult);
        
        return "Admin password fixed successfully. New hash: " + newPasswordHash + 
               ". Verification test: " + verificationResult;
    }
}