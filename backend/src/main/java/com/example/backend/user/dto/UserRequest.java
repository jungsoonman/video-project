package com.example.backend.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min=1,max=50) String name,
        @NotBlank String passwordHash
) {
}
