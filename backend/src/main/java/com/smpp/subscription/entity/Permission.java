package com.smpp.subscription.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "permissions")
@Data
@EqualsAndHashCode(exclude = {"roles"})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(length = 50)
    private String category;

    @ManyToMany(mappedBy = "permissions")
    @ToString.Exclude
    @JsonIgnore
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Predefined permissions
    public static final String SUBSCRIPTION_CREATE = "SUBSCRIPTION_CREATE";
    public static final String SUBSCRIPTION_READ = "SUBSCRIPTION_READ";
    public static final String SUBSCRIPTION_UPDATE = "SUBSCRIPTION_UPDATE";
    public static final String SUBSCRIPTION_DELETE = "SUBSCRIPTION_DELETE";
    public static final String SUBSCRIPTION_BULK_IMPORT = "SUBSCRIPTION_BULK_IMPORT";
    public static final String SUBSCRIPTION_BULK_EXPORT = "SUBSCRIPTION_BULK_EXPORT";
    
    public static final String USER_CREATE = "USER_CREATE";
    public static final String USER_READ = "USER_READ";
    public static final String USER_UPDATE = "USER_UPDATE";
    public static final String USER_DELETE = "USER_DELETE";
    public static final String USER_MANAGE_ROLES = "USER_MANAGE_ROLES";
    
    public static final String CACHE_MANAGE = "CACHE_MANAGE";
    public static final String CACHE_INVALIDATE = "CACHE_INVALIDATE";
    
    public static final String SYNC_EXECUTE = "SYNC_EXECUTE";
    public static final String SYNC_MONITOR = "SYNC_MONITOR";
    
    public static final String AUDIT_READ = "AUDIT_READ";
    public static final String AUDIT_EXPORT = "AUDIT_EXPORT";
    
    public static final String SYSTEM_CONFIGURE = "SYSTEM_CONFIGURE";
    public static final String SYSTEM_MONITOR = "SYSTEM_MONITOR";
    public static final String SYSTEM_BACKUP = "SYSTEM_BACKUP";
}