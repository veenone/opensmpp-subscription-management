package com.smpp.subscription.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class MsisdnValidatorTest {

    private MsisdnValidator msisdnValidator;

    @BeforeEach
    void setUp() {
        msisdnValidator = new MsisdnValidator();
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "+1234567890",      // US number
        "+33123456789",     // French number
        "+491234567890",    // German number
        "+8613800138000",   // Chinese number
        "+919876543210",    // Indian number
        "+14155552671",     // US with area code
        "+442071234567"     // UK number
    })
    void validate_ValidE164Numbers_ReturnsTrue(String msisdn) {
        assertTrue(msisdnValidator.isValid(msisdn));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "1234567890",       // Missing +
        "+",                // Only +
        "+1",               // Too short
        "+12345678901234567890", // Too long (>15 digits)
        "+12345abc67890",   // Contains letters
        "+1-234-567-890",   // Contains dashes
        "+1 234 567 890",   // Contains spaces
        "+1(234)567890",    // Contains parentheses
        "123-456-7890",     // US format without +
        "",                 // Empty string
        "   ",              // Only spaces
        "+49 0 1234567890", // German with leading zero
        "+33 01 23 45 67 89" // French with spaces
    })
    void validate_InvalidE164Numbers_ReturnsFalse(String msisdn) {
        assertFalse(msisdnValidator.isValid(msisdn));
    }

    @Test
    void validate_NullMsisdn_ReturnsFalse() {
        assertFalse(msisdnValidator.isValid(null));
    }

    @Test
    void normalize_ValidMsisdn_RemovesSpacesAndFormatting() {
        String input = "+1 (234) 567-890";
        String expected = "+1234567890";
        String result = msisdnValidator.normalize(input);
        assertEquals(expected, result);
    }

    @Test
    void normalize_AlreadyNormalized_ReturnsUnchanged() {
        String input = "+1234567890";
        String result = msisdnValidator.normalize(input);
        assertEquals(input, result);
    }

    @Test
    void normalize_NullInput_ReturnsNull() {
        assertNull(msisdnValidator.normalize(null));
    }

    @Test
    void normalize_EmptyInput_ReturnsEmpty() {
        String result = msisdnValidator.normalize("");
        assertEquals("", result);
    }

    @Test
    void extractCountryCode_ValidMsisdn_ReturnsCorrectCode() {
        assertEquals("1", msisdnValidator.extractCountryCode("+1234567890"));
        assertEquals("33", msisdnValidator.extractCountryCode("+33123456789"));
        assertEquals("49", msisdnValidator.extractCountryCode("+491234567890"));
        assertEquals("86", msisdnValidator.extractCountryCode("+8613800138000"));
        assertEquals("44", msisdnValidator.extractCountryCode("+442071234567"));
    }

    @Test
    void extractCountryCode_InvalidFormat_ReturnsNull() {
        assertNull(msisdnValidator.extractCountryCode("1234567890"));
        assertNull(msisdnValidator.extractCountryCode("+"));
        assertNull(msisdnValidator.extractCountryCode(""));
        assertNull(msisdnValidator.extractCountryCode(null));
    }

    @Test
    void getSubscriberNumber_ValidMsisdn_ReturnsSubscriberPart() {
        assertEquals("234567890", msisdnValidator.getSubscriberNumber("+1234567890"));
        assertEquals("123456789", msisdnValidator.getSubscriberNumber("+33123456789"));
        assertEquals("1234567890", msisdnValidator.getSubscriberNumber("+491234567890"));
    }

    @Test
    void isValidCountryCode_KnownCodes_ReturnsTrue() {
        assertTrue(msisdnValidator.isValidCountryCode("1"));   // US/Canada
        assertTrue(msisdnValidator.isValidCountryCode("33"));  // France
        assertTrue(msisdnValidator.isValidCountryCode("49"));  // Germany
        assertTrue(msisdnValidator.isValidCountryCode("86"));  // China
        assertTrue(msisdnValidator.isValidCountryCode("91"));  // India
        assertTrue(msisdnValidator.isValidCountryCode("44"));  // UK
    }

    @Test
    void isValidCountryCode_UnknownCodes_ReturnsFalse() {
        assertFalse(msisdnValidator.isValidCountryCode("999"));
        assertFalse(msisdnValidator.isValidCountryCode("0"));
        assertFalse(msisdnValidator.isValidCountryCode(""));
        assertFalse(msisdnValidator.isValidCountryCode(null));
    }

    @Test
    void formatForDisplay_ValidMsisdn_ReturnsFormattedString() {
        // US number formatting
        assertEquals("+1 234-567-8900", 
                msisdnValidator.formatForDisplay("+12345678900"));
        
        // UK number formatting
        assertEquals("+44 20 7123 4567", 
                msisdnValidator.formatForDisplay("+442071234567"));
                
        // Generic formatting for unknown countries
        assertEquals("+33 123 456 789", 
                msisdnValidator.formatForDisplay("+33123456789"));
    }

    @Test
    void validateAndNormalize_ValidInput_ReturnsNormalizedMsisdn() {
        String input = "+1 (234) 567-890";
        String result = msisdnValidator.validateAndNormalize(input);
        assertEquals("+1234567890", result);
        assertTrue(msisdnValidator.isValid(result));
    }

    @Test
    void validateAndNormalize_InvalidInput_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            msisdnValidator.validateAndNormalize("invalid");
        });
        
        assertThrows(IllegalArgumentException.class, () -> {
            msisdnValidator.validateAndNormalize("1234567890");
        });
        
        assertThrows(IllegalArgumentException.class, () -> {
            msisdnValidator.validateAndNormalize(null);
        });
    }

    @Test
    void getValidationErrors_ValidMsisdn_ReturnsEmptyList() {
        var errors = msisdnValidator.getValidationErrors("+1234567890");
        assertTrue(errors.isEmpty());
    }

    @Test
    void getValidationErrors_InvalidMsisdn_ReturnsErrorList() {
        var errors = msisdnValidator.getValidationErrors("1234567890");
        assertFalse(errors.isEmpty());
        assertTrue(errors.contains("MSISDN must start with +"));
        
        errors = msisdnValidator.getValidationErrors("+12345678901234567890");
        assertFalse(errors.isEmpty());
        assertTrue(errors.contains("MSISDN cannot exceed 15 digits"));
        
        errors = msisdnValidator.getValidationErrors("+1234abc567890");
        assertFalse(errors.isEmpty());
        assertTrue(errors.contains("MSISDN can only contain digits after +"));
    }

    @Test
    void performance_ValidateThousandsOfNumbers_CompletesQuickly() {
        // Performance test - should validate 10,000 numbers in reasonable time
        long startTime = System.currentTimeMillis();
        
        for (int i = 0; i < 10000; i++) {
            String msisdn = "+1234567" + String.format("%03d", i % 1000);
            msisdnValidator.isValid(msisdn);
        }
        
        long duration = System.currentTimeMillis() - startTime;
        
        // Should complete validation of 10,000 numbers in under 1 second
        assertTrue(duration < 1000, "Validation took too long: " + duration + "ms");
    }

    @Test
    void threadSafety_ConcurrentValidation_ThreadSafe() throws InterruptedException {
        // Test thread safety with concurrent validations
        Thread[] threads = new Thread[10];
        boolean[] results = new boolean[threads.length];
        
        for (int i = 0; i < threads.length; i++) {
            final int threadIndex = i;
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    String msisdn = "+1234567" + String.format("%03d", j % 100);
                    results[threadIndex] = msisdnValidator.isValid(msisdn);
                }
            });
        }
        
        for (Thread thread : threads) {
            thread.start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        // All threads should complete successfully
        for (boolean result : results) {
            assertTrue(result);
        }
    }
}