package com.smpp.subscription.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${app.security.jwt.secret:smpp-subscription-management-secret-key-for-development-only-with-sufficient-length-384bits}")
    private String jwtSecret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        log.debug("JWT Filter processing request to: {}", request.getRequestURI());
        String jwt = getJwtFromRequest(request);
        log.debug("JWT extracted: {}", jwt != null ? "token found" : "no token");

        if (StringUtils.hasText(jwt)) {
            try {
                Claims claims = Jwts.parser()
                        .verifyWith(getSigningKey())
                        .build()
                        .parseSignedClaims(jwt)
                        .getPayload();

                String userId = claims.getSubject();
                String username = claims.get("username", String.class);

                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Create basic authorities - in a real implementation, you'd fetch user roles
                    List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("SUBSCRIPTION_READ"),
                        new SimpleGrantedAuthority("SUBSCRIPTION_CREATE"),
                        new SimpleGrantedAuthority("SUBSCRIPTION_UPDATE"),
                        new SimpleGrantedAuthority("SUBSCRIPTION_DELETE"),
                        new SimpleGrantedAuthority("SUBSCRIPTION_EXPORT"),
                        new SimpleGrantedAuthority("SUBSCRIPTION_BULK_IMPORT")
                    );

                    UsernamePasswordAuthenticationToken authToken = 
                            new UsernamePasswordAuthenticationToken(username, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Set authentication for user: {}", username);
                }
            } catch (Exception e) {
                log.warn("JWT authentication failed: {}", e.getMessage());
                // Don't set authentication - let the request proceed without auth
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}