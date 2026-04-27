package com.example.KeuanganMandiri.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService(
            "test-secret-key-yang-cukup-panjang-untuk-test-unit-2026", 3600000L);

    @Test
    void generateToken_shouldReturnNonEmptyString() {
        String token = jwtService.generateToken(1L, "test@example.com");
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void validateToken_shouldReturnTrueForValidToken() {
        String token = jwtService.generateToken(1L, "test@example.com");
        assertTrue(jwtService.validateToken(token));
    }

    @Test
    void validateToken_shouldReturnFalseForInvalidToken() {
        assertFalse(jwtService.validateToken("invalid.token.here"));
    }

    @Test
    void extractUserId_shouldReturnCorrectId() {
        String token = jwtService.generateToken(42L, "user@example.com");
        assertEquals(42L, jwtService.extractUserId(token));
    }

    @Test
    void extractEmail_shouldReturnCorrectEmail() {
        String token = jwtService.generateToken(1L, "hello@world.com");
        assertEquals("hello@world.com", jwtService.extractEmail(token));
    }

    @Test
    void differentTokensForDifferentUsers() {
        String token1 = jwtService.generateToken(1L, "user1@mail.com");
        String token2 = jwtService.generateToken(2L, "user2@mail.com");
        assertNotEquals(token1, token2);
    }
}
