package com.smpp.subscription.testutil;

import com.github.javafaker.Faker;
import com.smpp.subscription.dto.BulkImportRequest;
import com.smpp.subscription.dto.SearchCriteria;
import com.smpp.subscription.dto.SubscriptionRequestDto;
import com.smpp.subscription.entity.ExternalChange;
import com.smpp.subscription.entity.Subscription;
import com.smpp.subscription.entity.User;
import lombok.experimental.UtilityClass;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.IntStream;

/**
 * Utility class for creating test data objects with realistic and varied data
 */
@UtilityClass
public class TestDataBuilder {
    
    private static final Faker faker = new Faker();
    
    // E.164 Country codes for realistic MSISDNs
    private static final String[] COUNTRY_CODES = {
        "+1", "+44", "+49", "+33", "+34", "+39", "+31", "+46", "+47", "+45",
        "+41", "+43", "+32", "+30", "+351", "+353", "+358", "+372", "+371", "+370"
    };
    
    /**
     * Create a valid Subscription entity with realistic data
     */
    public static Subscription createSubscription() {
        return Subscription.builder()
            .msisdn(generateValidMsisdn())
            .impi(generateImpi())
            .impu(generateImpu())
            .status(getRandomStatus())
            .createdAt(LocalDateTime.now().minusDays(faker.number().numberBetween(1, 365)))
            .updatedAt(LocalDateTime.now().minusHours(faker.number().numberBetween(1, 24)))
            .build();
    }
    
    /**
     * Create a Subscription with specific MSISDN
     */
    public static Subscription createSubscription(String msisdn) {
        return createSubscription()
            .toBuilder()
            .msisdn(msisdn)
            .build();
    }
    
    /**
     * Create a Subscription with specific status
     */
    public static Subscription createSubscription(Subscription.SubscriptionStatus status) {
        return createSubscription()
            .toBuilder()
            .status(status)
            .build();
    }
    
    /**
     * Create a Subscription with specific MSISDN and status
     */
    public static Subscription createSubscription(String msisdn, Subscription.SubscriptionStatus status) {
        return createSubscription()
            .toBuilder()
            .msisdn(msisdn)
            .status(status)
            .build();
    }
    
    /**
     * Create multiple Subscriptions
     */
    public static List<Subscription> createSubscriptions(int count) {
        return IntStream.range(0, count)
            .mapToObj(i -> createSubscription())
            .toList();
    }
    
    /**
     * Create SubscriptionRequestDto for API testing
     */
    public static SubscriptionRequestDto createSubscriptionRequestDto() {
        return SubscriptionRequestDto.builder()
            .msisdn(generateValidMsisdn())
            .impi(generateImpi())
            .impu(generateImpu())
            .status(getRandomStatus())
            .build();
    }
    
    /**
     * Create SubscriptionRequestDto with specific MSISDN
     */
    public static SubscriptionRequestDto createSubscriptionRequestDto(String msisdn) {
        return createSubscriptionRequestDto()
            .toBuilder()
            .msisdn(msisdn)
            .build();
    }
    
    /**
     * Create BulkImportRequest for bulk operations testing
     */
    public static BulkImportRequest createBulkImportRequest(int subscriptionCount) {
        List<SubscriptionRequestDto> subscriptions = IntStream.range(0, subscriptionCount)
            .mapToObj(i -> createSubscriptionRequestDto())
            .toList();
        
        return BulkImportRequest.builder()
            .subscriptions(subscriptions)
            .validateAll(true)
            .skipExisting(false)
            .batchSize(1000)
            .build();
    }
    
    /**
     * Create BulkImportRequest with mixed valid/invalid data for error testing
     */
    public static BulkImportRequest createMixedValidityBulkImportRequest(int validCount, int invalidCount) {
        List<SubscriptionRequestDto> subscriptions = new ArrayList<>();
        
        // Add valid subscriptions
        IntStream.range(0, validCount)
            .forEach(i -> subscriptions.add(createSubscriptionRequestDto()));
        
        // Add invalid subscriptions
        IntStream.range(0, invalidCount)
            .forEach(i -> subscriptions.add(createInvalidSubscriptionRequestDto()));
        
        return BulkImportRequest.builder()
            .subscriptions(subscriptions)
            .validateAll(false)
            .skipExisting(false)
            .batchSize(1000)
            .build();
    }
    
    /**
     * Create SearchCriteria for search testing
     */
    public static SearchCriteria createSearchCriteria() {
        return SearchCriteria.builder()
            .msisdn(faker.bool().bool() ? generateValidMsisdn().substring(0, 8) : null)
            .status(faker.bool().bool() ? getRandomStatus() : null)
            .createdAfter(faker.bool().bool() ? LocalDateTime.now().minusDays(30) : null)
            .createdBefore(faker.bool().bool() ? LocalDateTime.now() : null)
            .page(0)
            .size(20)
            .sortBy("createdAt")
            .sortDirection("desc")
            .build();
    }
    
    /**
     * Create ExternalChange for sync testing
     */
    public static ExternalChange createExternalChange() {
        return ExternalChange.builder()
            .tableName("subscriptions")
            .operation(getRandomChangeOperation())
            .entityId(faker.number().randomNumber())
            .msisdn(generateValidMsisdn())
            .oldData(Map.of("status", "ACTIVE"))
            .newData(Map.of("status", "SUSPENDED"))
            .changedAt(LocalDateTime.now().minusMinutes(faker.number().numberBetween(1, 60)))
            .processed(false)
            .retryCount(0)
            .build();
    }
    
    /**
     * Create User for security testing
     */
    public static User createUser() {
        return User.builder()
            .username(faker.name().username())
            .email(faker.internet().emailAddress())
            .firstName(faker.name().firstName())
            .lastName(faker.name().lastName())
            .enabled(true)
            .accountNonExpired(true)
            .accountNonLocked(true)
            .credentialsNonExpired(true)
            .createdAt(LocalDateTime.now().minusDays(faker.number().numberBetween(1, 100)))
            .build();
    }
    
    /**
     * Generate a valid E.164 MSISDN
     */
    public static String generateValidMsisdn() {
        String countryCode = COUNTRY_CODES[faker.number().numberBetween(0, COUNTRY_CODES.length)];
        String nationalNumber = faker.number().digits(faker.number().numberBetween(8, 12));
        return countryCode + nationalNumber;
    }
    
    /**
     * Generate an invalid MSISDN for negative testing
     */
    public static String generateInvalidMsisdn() {
        String[] invalidFormats = {
            "",                                    // Empty
            "123",                                 // Too short
            "123456789012345678901234567890",      // Too long
            "abc123456789",                        // Non-numeric
            "0123456789",                          // Starts with 0
            "+0123456789",                         // Country code starts with 0
            "++123456789",                         // Double plus
            " +1234567890 ",                       // With spaces
            "+1-234-567-8901",                     // With hyphens
        };
        
        return invalidFormats[faker.number().numberBetween(0, invalidFormats.length)];
    }
    
    /**
     * Generate IMPI (IP Multimedia Private Identity)
     */
    public static String generateImpi() {
        return faker.name().username() + "@" + faker.internet().domainName();
    }
    
    /**
     * Generate IMPU (IP Multimedia Public Identity)
     */
    public static String generateImpu() {
        return "sip:" + faker.name().username() + "@" + faker.internet().domainName();
    }
    
    /**
     * Get random subscription status
     */
    public static Subscription.SubscriptionStatus getRandomStatus() {
        Subscription.SubscriptionStatus[] statuses = Subscription.SubscriptionStatus.values();
        return statuses[faker.number().numberBetween(0, statuses.length)];
    }
    
    /**
     * Get random external change operation
     */
    public static String getRandomChangeOperation() {
        String[] operations = {"INSERT", "UPDATE", "DELETE"};
        return operations[faker.number().numberBetween(0, operations.length)];
    }
    
    /**
     * Create invalid SubscriptionRequestDto for negative testing
     */
    private static SubscriptionRequestDto createInvalidSubscriptionRequestDto() {
        return SubscriptionRequestDto.builder()
            .msisdn(generateInvalidMsisdn())
            .impi(faker.bool().bool() ? null : "invalid-impi")
            .impu(faker.bool().bool() ? null : "invalid-impu")
            .status(getRandomStatus())
            .build();
    }
    
    /**
     * Create performance test data with specific characteristics
     */
    public static List<Subscription> createPerformanceTestData(int count, String msisdnPrefix) {
        return IntStream.range(0, count)
            .mapToObj(i -> createSubscription(msisdnPrefix + String.format("%08d", i)))
            .toList();
    }
    
    /**
     * Create subscriptions with specific patterns for search testing
     */
    public static List<Subscription> createSearchTestData() {
        List<Subscription> subscriptions = new ArrayList<>();
        
        // Add subscriptions with specific patterns
        subscriptions.add(createSubscription("+1234567890", Subscription.SubscriptionStatus.ACTIVE));
        subscriptions.add(createSubscription("+1234567891", Subscription.SubscriptionStatus.SUSPENDED));
        subscriptions.add(createSubscription("+4412345678", Subscription.SubscriptionStatus.TERMINATED));
        subscriptions.add(createSubscription("+4912345678", Subscription.SubscriptionStatus.ACTIVE));
        
        // Add some random subscriptions
        subscriptions.addAll(createSubscriptions(10));
        
        return subscriptions;
    }
}