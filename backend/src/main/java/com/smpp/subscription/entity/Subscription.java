package com.smpp.subscription.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "subscriptions", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"msisdn"}),
           @UniqueConstraint(columnNames = {"impi"}),
           @UniqueConstraint(columnNames = {"impu"})
       })
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "MSISDN is required")
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid MSISDN format")
    @Column(name = "msisdn", nullable = false, unique = true)
    private String msisdn;

    @NotBlank(message = "IMPI is required")
    @Column(name = "impi", nullable = false, unique = true)
    private String impi;

    @NotBlank(message = "IMPU is required")
    @Column(name = "impu", nullable = false, unique = true)
    private String impu;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum SubscriptionStatus {
        ACTIVE,
        SUSPENDED,
        TERMINATED
    }
}