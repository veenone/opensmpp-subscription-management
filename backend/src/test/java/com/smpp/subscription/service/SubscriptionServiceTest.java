package com.smpp.subscription.service;

import com.smpp.subscription.entity.Subscription;
import com.smpp.subscription.repository.SubscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private SubscriptionService subscriptionService;

    private Subscription testSubscription;

    @BeforeEach
    void setUp() {
        testSubscription = Subscription.builder()
                .id(1L)
                .msisdn("+1234567890")
                .impi("test@example.com")
                .impu("sip:test@example.com")
                .status(Subscription.SubscriptionStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createSubscription_Success() {
        // Arrange
        when(subscriptionRepository.findByMsisdn(anyString())).thenReturn(Optional.empty());
        when(subscriptionRepository.save(any(Subscription.class))).thenReturn(testSubscription);

        // Act
        Subscription result = subscriptionService.createSubscription(testSubscription);

        // Assert
        assertNotNull(result);
        assertEquals(testSubscription.getMsisdn(), result.getMsisdn());
        verify(subscriptionRepository).save(testSubscription);
        verify(auditService).logSubscriptionCreate(eq(testSubscription), anyString());
    }

    @Test
    void createSubscription_DuplicateMsisdn_ThrowsException() {
        // Arrange
        when(subscriptionRepository.findByMsisdn(testSubscription.getMsisdn()))
                .thenReturn(Optional.of(testSubscription));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            subscriptionService.createSubscription(testSubscription);
        });
        verify(subscriptionRepository, never()).save(any());
    }

    @Test
    void getSubscriptionById_Found() {
        // Arrange
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.of(testSubscription));

        // Act
        Optional<Subscription> result = subscriptionService.getSubscriptionById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testSubscription.getId(), result.get().getId());
    }

    @Test
    void getSubscriptionById_NotFound() {
        // Arrange
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        Optional<Subscription> result = subscriptionService.getSubscriptionById(1L);

        // Assert
        assertFalse(result.isPresent());
    }

    @Test
    void getSubscriptionByMsisdn_Cached() {
        // Arrange
        when(subscriptionRepository.findByMsisdn(testSubscription.getMsisdn()))
                .thenReturn(Optional.of(testSubscription));

        // Act
        Optional<Subscription> result = subscriptionService.getSubscriptionByMsisdn(testSubscription.getMsisdn());

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testSubscription.getMsisdn(), result.get().getMsisdn());
    }

    @Test
    void updateSubscription_Success() {
        // Arrange
        Subscription updatedSubscription = testSubscription.toBuilder()
                .status(Subscription.SubscriptionStatus.INACTIVE)
                .build();
        
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.of(testSubscription));
        when(subscriptionRepository.save(any(Subscription.class))).thenReturn(updatedSubscription);

        // Act
        Subscription result = subscriptionService.updateSubscription(1L, updatedSubscription);

        // Assert
        assertEquals(Subscription.SubscriptionStatus.INACTIVE, result.getStatus());
        verify(auditService).logSubscriptionUpdate(eq(testSubscription), eq(updatedSubscription), anyString());
    }

    @Test
    void deleteSubscription_Success() {
        // Arrange
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.of(testSubscription));

        // Act
        subscriptionService.deleteSubscription(1L);

        // Assert
        verify(subscriptionRepository).delete(testSubscription);
        verify(auditService).logSubscriptionDelete(eq(testSubscription), anyString());
    }

    @Test
    void getAllSubscriptions_WithPagination() {
        // Arrange
        PageRequest pageRequest = PageRequest.of(0, 10);
        Page<Subscription> page = new PageImpl<>(List.of(testSubscription));
        when(subscriptionRepository.findAll(pageRequest)).thenReturn(page);

        // Act
        Page<Subscription> result = subscriptionService.getAllSubscriptions(pageRequest);

        // Assert
        assertEquals(1, result.getContent().size());
        assertEquals(testSubscription.getId(), result.getContent().get(0).getId());
    }

    @Test
    void searchSubscriptions_WithFilters() {
        // Arrange
        PageRequest pageRequest = PageRequest.of(0, 10);
        Page<Subscription> page = new PageImpl<>(List.of(testSubscription));
        when(subscriptionRepository.findByStatusAndMsisdnContaining(
                eq(Subscription.SubscriptionStatus.ACTIVE), 
                anyString(), 
                eq(pageRequest)
        )).thenReturn(page);

        // Act
        Page<Subscription> result = subscriptionService.searchSubscriptions(
                "+123", 
                Subscription.SubscriptionStatus.ACTIVE, 
                pageRequest
        );

        // Assert
        assertEquals(1, result.getContent().size());
    }

    @Test
    void bulkImport_ValidData() {
        // Arrange
        List<Subscription> subscriptions = List.of(testSubscription);
        when(subscriptionRepository.saveAll(anyList())).thenReturn(subscriptions);

        // Act
        List<Subscription> result = subscriptionService.bulkImport(subscriptions);

        // Assert
        assertEquals(1, result.size());
        verify(auditService).logBulkImport(eq(subscriptions), anyString());
    }

    @Test
    void getSubscriptionStats_ReturnsCorrectStats() {
        // Arrange
        when(subscriptionRepository.countByStatus(Subscription.SubscriptionStatus.ACTIVE)).thenReturn(100L);
        when(subscriptionRepository.countByStatus(Subscription.SubscriptionStatus.INACTIVE)).thenReturn(50L);
        when(subscriptionRepository.count()).thenReturn(150L);

        // Act
        var stats = subscriptionService.getSubscriptionStatistics();

        // Assert
        assertEquals(100L, stats.getActiveSubscriptions());
        assertEquals(50L, stats.getInactiveSubscriptions());
        assertEquals(150L, stats.getTotalSubscriptions());
    }
}