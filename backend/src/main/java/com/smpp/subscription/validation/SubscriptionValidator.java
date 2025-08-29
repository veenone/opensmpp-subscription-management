package com.smpp.subscription.validation;

import com.smpp.subscription.dto.SubscriptionRequestDto;
import com.smpp.subscription.util.MsisdnValidator;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Comprehensive validation utility for subscription data.
 */
@Slf4j
@UtilityClass
public class SubscriptionValidator {

    // IMPI validation pattern - typically user@domain or user.domain@realm
    private static final Pattern IMPI_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$"
    );

    // IMPU validation pattern - SIP URI format
    private static final Pattern IMPU_PATTERN = Pattern.compile(
        "^sip:[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$"
    );

    /**
     * Comprehensive validation of subscription request data.
     * 
     * @param request the subscription request to validate
     * @return ValidationResult containing all validation issues
     */
    public static ValidationResult validateSubscriptionRequest(SubscriptionRequestDto request) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        if (request == null) {
            errors.add("Subscription request cannot be null");
            return ValidationResult.builder()
                .valid(false)
                .errors(errors)
                .warnings(warnings)
                .build();
        }

        // Validate MSISDN
        validateMsisdn(request.getMsisdn(), errors, warnings);

        // Validate IMPI
        validateImpi(request.getImpi(), errors, warnings);

        // Validate IMPU
        validateImpu(request.getImpu(), errors, warnings);

        // Validate Status
        validateStatus(request.getStatus(), errors, warnings);

        // Cross-field validation
        validateConsistency(request, errors, warnings);

        boolean isValid = errors.isEmpty();
        
        if (!isValid) {
            log.warn("Subscription validation failed: {}", errors);
        }
        
        if (!warnings.isEmpty()) {
            log.info("Subscription validation warnings: {}", warnings);
        }

        return ValidationResult.builder()
            .valid(isValid)
            .errors(errors)
            .warnings(warnings)
            .build();
    }

    /**
     * Validate MSISDN field.
     */
    private static void validateMsisdn(String msisdn, List<String> errors, List<String> warnings) {
        if (msisdn == null || msisdn.trim().isEmpty()) {
            errors.add("MSISDN is required");
            return;
        }

        MsisdnValidator.ValidationResult msisdnResult = MsisdnValidator.validate(msisdn);
        if (!msisdnResult.isValid()) {
            errors.add("MSISDN validation failed: " + msisdnResult.getMessage());
        } else if (msisdnResult.hasWarning()) {
            warnings.add("MSISDN warning: " + msisdnResult.getMessage());
        }

        if (msisdnResult.isNormalized()) {
            warnings.add("MSISDN was normalized from " + msisdn + " to " + msisdnResult.getMsisdn());
        }
    }

    /**
     * Validate IMPI field.
     */
    private static void validateImpi(String impi, List<String> errors, List<String> warnings) {
        if (impi == null || impi.trim().isEmpty()) {
            errors.add("IMPI is required");
            return;
        }

        String trimmedImpi = impi.trim();

        // Length validation
        if (trimmedImpi.length() < 3) {
            errors.add("IMPI must be at least 3 characters long");
        } else if (trimmedImpi.length() > 256) {
            errors.add("IMPI must not exceed 256 characters");
        }

        // Format validation
        if (!IMPI_PATTERN.matcher(trimmedImpi).matches()) {
            errors.add("IMPI must be in valid format (user@domain)");
        }

        // Domain validation
        validateImpiDomain(trimmedImpi, warnings);
    }

    /**
     * Validate IMPU field.
     */
    private static void validateImpu(String impu, List<String> errors, List<String> warnings) {
        if (impu == null || impu.trim().isEmpty()) {
            errors.add("IMPU is required");
            return;
        }

        String trimmedImpu = impu.trim();

        // Length validation
        if (trimmedImpu.length() < 7) { // Minimum: sip:a@b
            errors.add("IMPU must be at least 7 characters long");
        } else if (trimmedImpu.length() > 256) {
            errors.add("IMPU must not exceed 256 characters");
        }

        // Format validation
        if (!IMPU_PATTERN.matcher(trimmedImpu).matches()) {
            errors.add("IMPU must be in valid SIP URI format (sip:user@domain)");
        }

        // SIP scheme validation
        if (!trimmedImpu.toLowerCase().startsWith("sip:")) {
            errors.add("IMPU must start with 'sip:'");
        }

        // Domain validation
        validateImpuDomain(trimmedImpu, warnings);
    }

    /**
     * Validate subscription status.
     */
    private static void validateStatus(Object status, List<String> errors, List<String> warnings) {
        if (status == null) {
            errors.add("Status is required");
            return;
        }

        // Additional business logic validation could be added here
        // For example, checking if certain status transitions are allowed
    }

    /**
     * Validate consistency between fields.
     */
    private static void validateConsistency(SubscriptionRequestDto request, 
                                          List<String> errors, List<String> warnings) {
        // Check if IMPI and IMPU domains are consistent
        if (request.getImpi() != null && request.getImpu() != null) {
            String impiDomain = extractDomain(request.getImpi());
            String impuDomain = extractSipDomain(request.getImpu());
            
            if (impiDomain != null && impuDomain != null && !impiDomain.equals(impuDomain)) {
                warnings.add("IMPI and IMPU domains are different (" + impiDomain + " vs " + impuDomain + ")");
            }
        }
    }

    /**
     * Validate IMPI domain.
     */
    private static void validateImpiDomain(String impi, List<String> warnings) {
        String domain = extractDomain(impi);
        if (domain != null) {
            validateDomainFormat(domain, "IMPI", warnings);
        }
    }

    /**
     * Validate IMPU domain.
     */
    private static void validateImpuDomain(String impu, List<String> warnings) {
        String domain = extractSipDomain(impu);
        if (domain != null) {
            validateDomainFormat(domain, "IMPU", warnings);
        }
    }

    /**
     * Validate domain format.
     */
    private static void validateDomainFormat(String domain, String fieldName, List<String> warnings) {
        if (domain.contains("localhost") || domain.contains("127.0.0.1")) {
            warnings.add(fieldName + " uses localhost domain - not suitable for production");
        }
        
        if (domain.contains("example.com") || domain.contains("test.com")) {
            warnings.add(fieldName + " uses example/test domain - ensure this is intentional");
        }
        
        if (!domain.contains(".")) {
            warnings.add(fieldName + " domain appears to be a single label - ensure this is correct");
        }
    }

    /**
     * Extract domain from email-like format.
     */
    private static String extractDomain(String emailLike) {
        if (emailLike == null || !emailLike.contains("@")) {
            return null;
        }
        String[] parts = emailLike.split("@");
        return parts.length > 1 ? parts[1] : null;
    }

    /**
     * Extract domain from SIP URI.
     */
    private static String extractSipDomain(String sipUri) {
        if (sipUri == null || !sipUri.startsWith("sip:") || !sipUri.contains("@")) {
            return null;
        }
        String userPart = sipUri.substring(4); // Remove "sip:"
        String[] parts = userPart.split("@");
        return parts.length > 1 ? parts[1] : null;
    }

    /**
     * Validation result class.
     */
    @lombok.Data
    @lombok.Builder
    public static class ValidationResult {
        private boolean valid;
        private List<String> errors;
        private List<String> warnings;
        
        public boolean hasWarnings() {
            return warnings != null && !warnings.isEmpty();
        }
        
        public boolean hasErrors() {
            return errors != null && !errors.isEmpty();
        }
    }
}