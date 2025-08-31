package com.smpp.subscription.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class MsisdnValidatorTest {

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
        assertTrue(MsisdnValidator.isValidE164(msisdn));
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
        assertFalse(MsisdnValidator.isValidE164(msisdn));
    }

    @Test
    void validate_NullMsisdn_ReturnsFalse() {
        assertFalse(MsisdnValidator.isValidE164(null));
    }

    @Test
    void normalize_ValidMsisdn_RemovesSpacesAndFormatting() {
        String input = "+1 (234) 567-890";
        String expected = "+1234567890";
        String result = MsisdnValidator.normalizeToE164(input);
        assertEquals(expected, result);
    }

    @Test
    void normalize_AlreadyNormalized_ReturnsUnchanged() {
        String input = "+1234567890";
        String result = MsisdnValidator.normalizeToE164(input);
        assertEquals(input, result);
    }

    @Test
    void normalize_NullInput_ReturnsNull() {
        assertNull(MsisdnValidator.normalizeToE164(null));
    }

    @Test
    void normalize_EmptyInput_ReturnsNull() {
        String result = MsisdnValidator.normalizeToE164("");
        assertNull(result);
    }

    @Test
    void extractCountryCode_ValidMsisdn_ReturnsCorrectCode() {
        assertEquals("1", MsisdnValidator.extractCountryCode("+1234567890"));
        assertEquals("33", MsisdnValidator.extractCountryCode("+33123456789"));
        assertEquals("49", MsisdnValidator.extractCountryCode("+491234567890"));
        assertEquals("86", MsisdnValidator.extractCountryCode("+8613800138000"));
        assertEquals("44", MsisdnValidator.extractCountryCode("+442071234567"));
    }

    @Test
    void extractCountryCode_InvalidFormat_ReturnsNull() {
        assertNull(MsisdnValidator.extractCountryCode("1234567890"));
        assertNull(MsisdnValidator.extractCountryCode("+"));
        assertNull(MsisdnValidator.extractCountryCode(""));
        assertNull(MsisdnValidator.extractCountryCode(null));
    }

    @Test
    void performance_ValidateThousandsOfNumbers_CompletesQuickly() {
        // Performance test - should validate 10,000 numbers in reasonable time
        long startTime = System.currentTimeMillis();
        
        for (int i = 0; i < 10000; i++) {
            String msisdn = "+1234567" + String.format("%03d", i % 1000);
            MsisdnValidator.isValidE164(msisdn);
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
                    results[threadIndex] = MsisdnValidator.isValidE164(msisdn);
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
