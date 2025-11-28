package com.example.backend.auth.dto;

public record TokenResponse(String accessToken, String tokenType, long expiresInMs) {
    public static TokenResponse bearer(String accessToken, long expiresInMs)
    {
        return new TokenResponse(accessToken , "Bearer",expiresInMs);
    }
}
