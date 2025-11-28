package com.example.backend.user.dto;

import java.time.LocalDateTime;

public record UserProfileDTO(
        Long id,
        String email,
        String passwordHash,
        LocalDateTime createdAt,
        String profileImage
) {

}
