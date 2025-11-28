package com.example.backend.user.dto;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String email,
        String name,
        String passwordHash,
        LocalDateTime createdAt,
        String profileKey
) {
}
