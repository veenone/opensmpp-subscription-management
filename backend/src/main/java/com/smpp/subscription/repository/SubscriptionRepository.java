package com.smpp.subscription.repository;

import com.smpp.subscription.entity.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long>, JpaSpecificationExecutor<Subscription> {

    Optional<Subscription> findByMsisdn(String msisdn);
    Optional<Subscription> findByImpi(String impi);
    Optional<Subscription> findByImpu(String impu);

    @Query("SELECT s FROM Subscription s WHERE s.status = :status")
    List<Subscription> findByStatus(@Param("status") Subscription.SubscriptionStatus status);

    boolean existsByMsisdn(String msisdn);
    boolean existsByImpi(String impi);
    boolean existsByImpu(String impu);

    // Count methods for statistics
    long countByStatus(Subscription.SubscriptionStatus status);

    // Search methods
    Page<Subscription> findByStatusAndMsisdnContaining(
        Subscription.SubscriptionStatus status,
        String msisdn,
        Pageable pageable
    );
}