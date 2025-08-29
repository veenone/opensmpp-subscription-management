package com.smpp.subscription.util;

import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.regex.Pattern;

/**
 * Utility class for validating MSISDN (Mobile Station International Subscriber Directory Number) 
 * according to E.164 international telecommunication numbering plan.
 * 
 * E.164 format: +[country code][subscriber number]
 * - Maximum 15 digits total (including country code)
 * - Country code: 1-3 digits
 * - National number: up to 12 digits
 */
@Slf4j
@UtilityClass
public class MsisdnValidator {

    // E.164 format: + followed by 1-15 digits, starting with country code
    private static final Pattern E164_PATTERN = Pattern.compile("^\\+[1-9]\\d{1,14}$");
    
    // Pattern for basic MSISDN without + prefix (fallback validation)
    private static final Pattern BASIC_MSISDN_PATTERN = Pattern.compile("^[1-9]\\d{7,14}$");
    
    // Country code ranges (1-3 digits)
    private static final Pattern COUNTRY_CODE_PATTERN = Pattern.compile("^\\+([1-9]\\d{0,2})");
    
    // Common country codes for validation (not exhaustive but covers major regions)
    private static final Map<String, String> COUNTRY_CODES = Map.of(
        "1", "North America (US, Canada)",
        "7", "Russia/Kazakhstan",
        "20", "Egypt",
        "27", "South Africa",
        "30", "Greece",
        "31", "Netherlands",
        "32", "Belgium",
        "33", "France",
        "34", "Spain",
        "39", "Italy",
        "40", "Romania",
        "41", "Switzerland",
        "43", "Austria",
        "44", "United Kingdom",
        "45", "Denmark",
        "46", "Sweden",
        "47", "Norway",
        "48", "Poland",
        "49", "Germany",
        "51", "Peru",
        "52", "Mexico",
        "53", "Cuba",
        "54", "Argentina",
        "55", "Brazil",
        "56", "Chile",
        "57", "Colombia",
        "58", "Venezuela",
        "60", "Malaysia",
        "61", "Australia",
        "62", "Indonesia",
        "63", "Philippines",
        "64", "New Zealand",
        "65", "Singapore",
        "66", "Thailand",
        "81", "Japan",
        "82", "South Korea",
        "84", "Vietnam",
        "86", "China",
        "90", "Turkey",
        "91", "India",
        "92", "Pakistan",
        "93", "Afghanistan",
        "94", "Sri Lanka",
        "95", "Myanmar",
        "98", "Iran"
    );

    /**
     * Validates if the given MSISDN follows E.164 format.
     * 
     * @param msisdn the MSISDN to validate
     * @return true if valid E.164 format, false otherwise
     */
    public static boolean isValidE164(String msisdn) {
        if (msisdn == null || msisdn.trim().isEmpty()) {
            return false;
        }
        
        String trimmed = msisdn.trim();
        boolean isValid = E164_PATTERN.matcher(trimmed).matches();
        
        if (isValid) {
            log.debug("MSISDN {} is valid E.164 format", msisdn);
        } else {
            log.debug("MSISDN {} is not valid E.164 format", msisdn);
        }
        
        return isValid;
    }

    /**
     * Validates the country code in the MSISDN.
     * 
     * @param msisdn the MSISDN to validate
     * @return true if country code is recognized, false otherwise
     */
    public static boolean hasValidCountryCode(String msisdn) {
        if (!isValidE164(msisdn)) {
            return false;
        }
        
        String countryCode = extractCountryCode(msisdn);
        boolean isValid = countryCode != null && COUNTRY_CODES.containsKey(countryCode);
        
        if (isValid) {
            log.debug("MSISDN {} has valid country code: {} ({})", 
                msisdn, countryCode, COUNTRY_CODES.get(countryCode));
        } else {
            log.debug("MSISDN {} has unrecognized country code: {}", msisdn, countryCode);
        }
        
        return isValid;
    }

    /**
     * Extracts the country code from E.164 formatted MSISDN.
     * 
     * @param msisdn the E.164 formatted MSISDN
     * @return the country code or null if invalid format
     */
    public static String extractCountryCode(String msisdn) {
        if (!isValidE164(msisdn)) {
            return null;
        }
        
        // Try to extract country code (1-3 digits after +)
        String digits = msisdn.substring(1); // Remove the + sign
        
        // Try 3-digit country codes first
        for (int length = 3; length >= 1; length--) {
            if (digits.length() >= length) {
                String potentialCode = digits.substring(0, length);
                if (COUNTRY_CODES.containsKey(potentialCode)) {
                    return potentialCode;
                }
            }
        }
        
        // Fallback: return first 1-3 digits as country code
        if (digits.length() >= 3) {
            return digits.substring(0, 3);
        } else if (digits.length() >= 2) {
            return digits.substring(0, 2);
        } else {
            return digits.substring(0, 1);
        }
    }

    /**
     * Normalizes MSISDN to E.164 format.
     * Attempts to add + prefix if missing and validates the result.
     * 
     * @param msisdn the MSISDN to normalize
     * @return normalized E.164 MSISDN or null if cannot be normalized
     */
    public static String normalizeToE164(String msisdn) {
        if (msisdn == null || msisdn.trim().isEmpty()) {
            return null;
        }
        
        String trimmed = msisdn.trim();
        
        // Already in E.164 format
        if (isValidE164(trimmed)) {
            return trimmed;
        }
        
        // Try adding + prefix
        if (BASIC_MSISDN_PATTERN.matcher(trimmed).matches()) {
            String normalized = "+" + trimmed;
            if (isValidE164(normalized)) {
                log.debug("Normalized MSISDN {} to E.164 format: {}", msisdn, normalized);
                return normalized;
            }
        }
        
        // Remove any non-digit characters except +
        String cleaned = trimmed.replaceAll("[^+\\d]", "");
        
        // Try again with cleaned version
        if (!cleaned.startsWith("+")) {
            cleaned = "+" + cleaned;
        }
        
        if (isValidE164(cleaned)) {
            log.debug("Cleaned and normalized MSISDN {} to E.164 format: {}", msisdn, cleaned);
            return cleaned;
        }
        
        log.warn("Could not normalize MSISDN {} to E.164 format", msisdn);
        return null;
    }

    /**
     * Validates MSISDN length according to E.164 specifications.
     * 
     * @param msisdn the MSISDN to validate
     * @return true if length is valid (maximum 15 digits including country code)
     */
    public static boolean hasValidLength(String msisdn) {
        if (msisdn == null || msisdn.trim().isEmpty()) {
            return false;
        }
        
        String trimmed = msisdn.trim();
        
        // Remove + and count digits
        String digitsOnly = trimmed.replaceAll("[^\\d]", "");
        boolean isValid = digitsOnly.length() >= 8 && digitsOnly.length() <= 15;
        
        if (!isValid) {
            log.debug("MSISDN {} has invalid length: {} digits (should be 8-15)", 
                msisdn, digitsOnly.length());
        }
        
        return isValid;
    }

    /**
     * Comprehensive MSISDN validation combining all checks.
     * 
     * @param msisdn the MSISDN to validate
     * @return ValidationResult containing validation status and details
     */
    public static ValidationResult validate(String msisdn) {
        if (msisdn == null || msisdn.trim().isEmpty()) {
            return ValidationResult.invalid("MSISDN cannot be null or empty");
        }
        
        String trimmed = msisdn.trim();
        
        if (!hasValidLength(trimmed)) {
            return ValidationResult.invalid("MSISDN length must be 8-15 digits");
        }
        
        if (!isValidE164(trimmed)) {
            // Try to normalize
            String normalized = normalizeToE164(trimmed);
            if (normalized != null) {
                return ValidationResult.validWithNormalization(normalized, 
                    "MSISDN normalized to E.164 format");
            }
            return ValidationResult.invalid("MSISDN does not conform to E.164 format");
        }
        
        String countryCode = extractCountryCode(trimmed);
        if (!COUNTRY_CODES.containsKey(countryCode)) {
            return ValidationResult.validWithWarning(trimmed, 
                "Country code " + countryCode + " is not in the recognized list");
        }
        
        return ValidationResult.valid(trimmed, "Valid E.164 MSISDN");
    }

    /**
     * Result of MSISDN validation.
     */
    public static class ValidationResult {
        private final boolean valid;
        private final boolean normalized;
        private final boolean hasWarning;
        private final String msisdn;
        private final String message;
        
        private ValidationResult(boolean valid, boolean normalized, boolean hasWarning, 
                               String msisdn, String message) {
            this.valid = valid;
            this.normalized = normalized;
            this.hasWarning = hasWarning;
            this.msisdn = msisdn;
            this.message = message;
        }
        
        public static ValidationResult valid(String msisdn, String message) {
            return new ValidationResult(true, false, false, msisdn, message);
        }
        
        public static ValidationResult validWithNormalization(String normalizedMsisdn, String message) {
            return new ValidationResult(true, true, false, normalizedMsisdn, message);
        }
        
        public static ValidationResult validWithWarning(String msisdn, String message) {
            return new ValidationResult(true, false, true, msisdn, message);
        }
        
        public static ValidationResult invalid(String message) {
            return new ValidationResult(false, false, false, null, message);
        }
        
        // Getters
        public boolean isValid() { return valid; }
        public boolean isNormalized() { return normalized; }
        public boolean hasWarning() { return hasWarning; }
        public String getMsisdn() { return msisdn; }
        public String getMessage() { return message; }
    }
}