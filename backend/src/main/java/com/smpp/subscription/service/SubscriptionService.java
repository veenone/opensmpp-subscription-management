package com.smpp.subscription.service;

import com.smpp.subscription.dto.BulkImportRequest;
import com.smpp.subscription.dto.BulkImportResponse;
import com.smpp.subscription.dto.SearchCriteria;
import com.smpp.subscription.dto.SubscriptionRequestDto;
import com.smpp.subscription.entity.Subscription;
import com.smpp.subscription.repository.SubscriptionRepository;
import com.smpp.subscription.util.MsisdnValidator;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final AuditService auditService;

    @Transactional
    public Subscription createSubscription(Subscription subscription) {
        // Validate and normalize MSISDN
        MsisdnValidator.ValidationResult validationResult = MsisdnValidator.validate(subscription.getMsisdn());
        if (!validationResult.isValid()) {
            throw new IllegalArgumentException("Invalid MSISDN: " + validationResult.getMessage());
        }
        
        if (validationResult.isNormalized()) {
            log.info("MSISDN normalized from {} to {}", subscription.getMsisdn(), validationResult.getMsisdn());
            subscription.setMsisdn(validationResult.getMsisdn());
        }
        
        // Check for duplicates
        if (subscriptionRepository.existsByMsisdn(subscription.getMsisdn())) {
            throw new EntityExistsException("Subscription with MSISDN " + subscription.getMsisdn() + " already exists");
        }
        if (subscriptionRepository.existsByImpi(subscription.getImpi())) {
            throw new EntityExistsException("Subscription with IMPI " + subscription.getImpi() + " already exists");
        }
        if (subscriptionRepository.existsByImpu(subscription.getImpu())) {
            throw new EntityExistsException("Subscription with IMPU " + subscription.getImpu() + " already exists");
        }
        
        log.info("Creating new subscription for MSISDN: {}", subscription.getMsisdn());
        Subscription savedSubscription = subscriptionRepository.save(subscription);
        auditService.logSubscriptionCreate(savedSubscription, getCurrentUser());
        return savedSubscription;
    }


    @Transactional
    @CacheEvict(value = "subscriptions", key = "#subscription.msisdn")
    public Subscription updateSubscription(Subscription subscription) {
        Subscription existingSubscription = subscriptionRepository.findByMsisdn(subscription.getMsisdn())
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found"));
        
        existingSubscription.setImpi(subscription.getImpi());
        existingSubscription.setImpu(subscription.getImpu());
        existingSubscription.setStatus(subscription.getStatus());
        
        return subscriptionRepository.save(existingSubscription);
    }

    @Transactional
    @CacheEvict(value = "subscriptions", key = "#msisdn")
    public void deleteSubscription(String msisdn) {
        Subscription subscription = subscriptionRepository.findByMsisdn(msisdn)
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found"));
        
        subscriptionRepository.delete(subscription);
    }

    @Transactional(readOnly = true)
    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Subscription> getSubscriptionsByStatus(Subscription.SubscriptionStatus status) {
        return subscriptionRepository.findByStatus(status);
    }

    /**
     * Get subscription by ID with caching (returns Optional for test compatibility).
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "subscriptions", key = "#id")
    public Optional<Subscription> getSubscriptionById(Long id) {
        return subscriptionRepository.findById(id);
    }

    /**
     * Get subscription by ID - throws exception if not found.
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "subscriptions", key = "#id")
    public Subscription findSubscriptionById(Long id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subscription with ID " + id + " not found"));
    }

    /**
     * Update subscription by ID.
     */
    @Transactional
    @CacheEvict(value = "subscriptions", allEntries = true)
    public Subscription updateSubscriptionById(Long id, Subscription updateData) {
        Optional<Subscription> existingOptional = getSubscriptionById(id);
        if (existingOptional.isEmpty()) {
            throw new EntityNotFoundException("Subscription with ID " + id + " not found");
        }
        Subscription existingSubscription = existingOptional.get();
        
        // Validate MSISDN if it's being updated
        if (updateData.getMsisdn() != null && 
            !updateData.getMsisdn().equals(existingSubscription.getMsisdn())) {
            
            MsisdnValidator.ValidationResult validationResult = MsisdnValidator.validate(updateData.getMsisdn());
            if (!validationResult.isValid()) {
                throw new IllegalArgumentException("Invalid MSISDN: " + validationResult.getMessage());
            }
            
            if (validationResult.isNormalized()) {
                log.info("MSISDN normalized from {} to {}", updateData.getMsisdn(), validationResult.getMsisdn());
                updateData.setMsisdn(validationResult.getMsisdn());
            }
            
            if (subscriptionRepository.existsByMsisdn(updateData.getMsisdn())) {
                throw new EntityExistsException("Subscription with MSISDN " + updateData.getMsisdn() + " already exists");
            }
            
            existingSubscription.setMsisdn(updateData.getMsisdn());
        }
        
        // Update other fields if provided
        if (updateData.getImpi() != null) {
            if (subscriptionRepository.existsByImpi(updateData.getImpi()) && 
                !updateData.getImpi().equals(existingSubscription.getImpi())) {
                throw new EntityExistsException("Subscription with IMPI " + updateData.getImpi() + " already exists");
            }
            existingSubscription.setImpi(updateData.getImpi());
        }
        
        if (updateData.getImpu() != null) {
            if (subscriptionRepository.existsByImpu(updateData.getImpu()) && 
                !updateData.getImpu().equals(existingSubscription.getImpu())) {
                throw new EntityExistsException("Subscription with IMPU " + updateData.getImpu() + " already exists");
            }
            existingSubscription.setImpu(updateData.getImpu());
        }
        
        if (updateData.getStatus() != null) {
            existingSubscription.setStatus(updateData.getStatus());
        }
        
        log.info("Updating subscription ID: {}, MSISDN: {}", id, existingSubscription.getMsisdn());
        Subscription updatedSubscription = subscriptionRepository.save(existingSubscription);
        auditService.logSubscriptionUpdate(existingSubscription, updatedSubscription, getCurrentUser());
        return updatedSubscription;
    }

    /**
     * Delete subscription by ID.
     */
    @Transactional
    @CacheEvict(value = "subscriptions", allEntries = true)
    public void deleteSubscriptionById(Long id) {
        Optional<Subscription> subscriptionOptional = getSubscriptionById(id);
        if (subscriptionOptional.isEmpty()) {
            throw new EntityNotFoundException("Subscription with ID " + id + " not found");
        }
        Subscription subscription = subscriptionOptional.get();
        log.info("Deleting subscription ID: {}, MSISDN: {}", id, subscription.getMsisdn());
        subscriptionRepository.delete(subscription);
        auditService.logSubscriptionDelete(subscription, getCurrentUser());
    }

    /**
     * Get paginated subscriptions.
     */
    @Transactional(readOnly = true)
    public Page<Subscription> getSubscriptions(Pageable pageable) {
        log.debug("Fetching subscriptions page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return subscriptionRepository.findAll(pageable);
    }

    /**
     * Advanced search with filtering and pagination.
     */
    @Transactional(readOnly = true)
    public Page<Subscription> searchSubscriptions(SearchCriteria criteria) {
        log.debug("Searching subscriptions with criteria: {}", criteria);
        
        if (!criteria.hasValidDateRanges()) {
            throw new IllegalArgumentException("Invalid date ranges in search criteria");
        }
        
        // Create pageable object
        Sort sort = Sort.by(
            "desc".equalsIgnoreCase(criteria.getSortDirection()) ? 
                Sort.Direction.DESC : Sort.Direction.ASC,
            mapSortField(criteria.getSortBy())
        );
        
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize(), sort);
        
        // Build specification for filtering
        Specification<Subscription> spec = buildSpecification(criteria);
        
        return subscriptionRepository.findAll(spec, pageable);
    }

    /**
     * Bulk import subscriptions.
     */
    @Transactional
    @CacheEvict(value = "subscriptions", allEntries = true)
    public BulkImportResponse bulkImportSubscriptions(BulkImportRequest request) {
        long startTime = System.currentTimeMillis();
        log.info("Starting bulk import of {} subscriptions", request.getSubscriptions().size());
        
        BulkImportResponse.BulkImportResponseBuilder responseBuilder = BulkImportResponse.builder()
            .totalProcessed(request.getSubscriptions().size())
            .successfulImports(0)
            .failedImports(0)
            .skippedDuplicates(0)
            .errors(new ArrayList<>());
        
        int successful = 0;
        int failed = 0;
        int skipped = 0;
        List<BulkImportResponse.ImportError> errors = new ArrayList<>();
        
        // Validate all entries first if requested
        if (request.getValidateAll()) {
            for (int i = 0; i < request.getSubscriptions().size(); i++) {
                SubscriptionRequestDto dto = request.getSubscriptions().get(i);
                try {
                    validateSubscriptionDto(dto);
                } catch (Exception e) {
                    errors.add(BulkImportResponse.ImportError.builder()
                        .row(i + 1)
                        .msisdn(dto.getMsisdn())
                        .error("Validation failed: " + e.getMessage())
                        .field("general")
                        .build());
                }
            }
            
            if (!errors.isEmpty()) {
                return responseBuilder
                    .errors(errors)
                    .failedImports(errors.size())
                    .status(BulkImportResponse.ImportStatus.FAILED)
                    .processingTimeMs(System.currentTimeMillis() - startTime)
                    .build();
            }
        }
        
        // Process each subscription
        for (int i = 0; i < request.getSubscriptions().size(); i++) {
            SubscriptionRequestDto dto = request.getSubscriptions().get(i);
            try {
                // Check for existing subscription
                if (subscriptionRepository.existsByMsisdn(dto.getMsisdn())) {
                    if (request.getSkipExisting()) {
                        skipped++;
                        continue;
                    } else {
                        throw new EntityExistsException("MSISDN already exists");
                    }
                }
                
                // Create subscription
                Subscription subscription = dto.toEntity();
                createSubscription(subscription);
                successful++;
                
            } catch (Exception e) {
                failed++;
                errors.add(BulkImportResponse.ImportError.builder()
                    .row(i + 1)
                    .msisdn(dto.getMsisdn())
                    .error(e.getMessage())
                    .field("general")
                    .build());
                
                log.warn("Failed to import subscription at row {}: {}", i + 1, e.getMessage());
            }
        }
        
        BulkImportResponse.ImportStatus status;
        if (failed == 0) {
            status = BulkImportResponse.ImportStatus.SUCCESS;
        } else if (successful > 0) {
            status = BulkImportResponse.ImportStatus.PARTIAL_SUCCESS;
        } else {
            status = BulkImportResponse.ImportStatus.FAILED;
        }
        
        long processingTime = System.currentTimeMillis() - startTime;
        log.info("Bulk import completed. Success: {}, Failed: {}, Skipped: {}, Time: {}ms", 
            successful, failed, skipped, processingTime);
        
        return responseBuilder
            .successfulImports(successful)
            .failedImports(failed)
            .skippedDuplicates(skipped)
            .errors(errors)
            .status(status)
            .processingTimeMs(processingTime)
            .build();
    }

    /**
     * Build JPA Specification for advanced search.
     */
    private Specification<Subscription> buildSpecification(SearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (criteria.getMsisdn() != null && !criteria.getMsisdn().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("msisdn")), 
                    "%" + criteria.getMsisdn().toLowerCase() + "%"
                ));
            }
            
            if (criteria.getImpi() != null && !criteria.getImpi().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("impi")), 
                    "%" + criteria.getImpi().toLowerCase() + "%"
                ));
            }
            
            if (criteria.getImpu() != null && !criteria.getImpu().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("impu")), 
                    "%" + criteria.getImpu().toLowerCase() + "%"
                ));
            }
            
            if (criteria.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), criteria.getStatus()));
            }
            
            if (criteria.getCreatedAfter() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("createdAt"), criteria.getCreatedAfter()
                ));
            }
            
            if (criteria.getCreatedBefore() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("createdAt"), criteria.getCreatedBefore()
                ));
            }
            
            if (criteria.getUpdatedAfter() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("updatedAt"), criteria.getUpdatedAfter()
                ));
            }
            
            if (criteria.getUpdatedBefore() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("updatedAt"), criteria.getUpdatedBefore()
                ));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Map API sort field names to entity field names.
     */
    private String mapSortField(String sortField) {
        return switch (sortField) {
            case "createdAt" -> "createdAt";
            case "updatedAt" -> "updatedAt";
            case "msisdn" -> "msisdn";
            case "impi" -> "impi";
            case "impu" -> "impu";
            case "status" -> "status";
            case "id" -> "id";
            default -> "createdAt"; // Default fallback
        };
    }

    /**
     * Validate subscription DTO for bulk import.
     */
    private void validateSubscriptionDto(SubscriptionRequestDto dto) {
        if (dto.getMsisdn() == null || dto.getMsisdn().trim().isEmpty()) {
            throw new IllegalArgumentException("MSISDN is required");
        }
        
        MsisdnValidator.ValidationResult validationResult = MsisdnValidator.validate(dto.getMsisdn());
        if (!validationResult.isValid()) {
            throw new IllegalArgumentException("Invalid MSISDN: " + validationResult.getMessage());
        }
        
        if (dto.getImpi() == null || dto.getImpi().trim().isEmpty()) {
            throw new IllegalArgumentException("IMPI is required");
        }
        
        if (dto.getImpu() == null || dto.getImpu().trim().isEmpty()) {
            throw new IllegalArgumentException("IMPU is required");
        }
        
        if (dto.getStatus() == null) {
            throw new IllegalArgumentException("Status is required");
        }
    }

    // Additional methods expected by tests

    /**
     * Get subscription by MSISDN returning Optional.
     */
    @Transactional(readOnly = true)
    public Optional<Subscription> getSubscriptionByMsisdn(String msisdn) {
        return subscriptionRepository.findByMsisdn(msisdn);
    }

    /**
     * Update subscription by ID (test-compatible signature).
     */
    @Transactional
    @CacheEvict(value = "subscriptions", allEntries = true)
    public Subscription updateSubscription(Long id, Subscription updateData) {
        return updateSubscriptionById(id, updateData);
    }

    /**
     * Delete subscription by ID (test-compatible signature).
     */
    @Transactional
    @CacheEvict(value = "subscriptions", allEntries = true)
    public void deleteSubscription(Long id) {
        deleteSubscriptionById(id);
    }

    /**
     * Get paginated subscriptions (test-compatible signature).
     */
    @Transactional(readOnly = true)
    public Page<Subscription> getAllSubscriptions(Pageable pageable) {
        return getSubscriptions(pageable);
    }

    /**
     * Search subscriptions with filters (test-compatible signature).
     */
    @Transactional(readOnly = true)
    public Page<Subscription> searchSubscriptions(String msisdn, Subscription.SubscriptionStatus status, Pageable pageable) {
        return subscriptionRepository.findByStatusAndMsisdnContaining(status, msisdn, pageable);
    }

    /**
     * Bulk import subscriptions (test-compatible signature).
     */
    @Transactional
    @CacheEvict(value = "subscriptions", allEntries = true)
    public List<Subscription> bulkImport(List<Subscription> subscriptions) {
        List<Subscription> saved = subscriptionRepository.saveAll(subscriptions);
        auditService.logBulkImport(subscriptions, getCurrentUser());
        return saved;
    }

    /**
     * Get subscription statistics.
     */
    @Transactional(readOnly = true)
    public SubscriptionStatistics getSubscriptionStatistics() {
        long totalSubscriptions = subscriptionRepository.count();
        long activeSubscriptions = subscriptionRepository.countByStatus(Subscription.SubscriptionStatus.ACTIVE);
        long inactiveSubscriptions = subscriptionRepository.countByStatus(Subscription.SubscriptionStatus.INACTIVE);

        return new SubscriptionStatistics(totalSubscriptions, activeSubscriptions, inactiveSubscriptions);
    }

    /**
     * Get current user from security context.
     */
    private String getCurrentUser() {
        // This would typically extract from SecurityContext
        return "SYSTEM";
    }

    /**
     * Statistics data class.
     */
    public static class SubscriptionStatistics {
        private final long totalSubscriptions;
        private final long activeSubscriptions;
        private final long inactiveSubscriptions;

        public SubscriptionStatistics(long totalSubscriptions, long activeSubscriptions, long inactiveSubscriptions) {
            this.totalSubscriptions = totalSubscriptions;
            this.activeSubscriptions = activeSubscriptions;
            this.inactiveSubscriptions = inactiveSubscriptions;
        }

        public long getTotalSubscriptions() { return totalSubscriptions; }
        public long getActiveSubscriptions() { return activeSubscriptions; }
        public long getInactiveSubscriptions() { return inactiveSubscriptions; }
    }
}