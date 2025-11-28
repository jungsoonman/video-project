package com.example.backend.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity @Table(name="refresh_tokens")
@Getter @NoArgsConstructor
public class RefreshToken {
    @Id    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private Long userId;
    @Column(nullable = false ,unique = true, length = 512)private String token;
    @Column(nullable = false) private Instant expiresAt;

    public RefreshToken(Long userId,String token, Instant expiresAt){
        this.userId = userId;
        this.token = token;
        this.expiresAt = expiresAt;
    }
}
