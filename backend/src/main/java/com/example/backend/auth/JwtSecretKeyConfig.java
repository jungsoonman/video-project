package com.example.backend.auth;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
@Configuration
public class JwtSecretKeyConfig {

    @Bean("jwtSecretKey")
    SecretKey jwtSecretKey(@Value("${jwt.secret}") String base64) {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64));
    }
    @Bean("accessValMs")
    Long accessValidityMs(@Value("${jwt.access-token-validity-ms}")Long aMs){return aMs;}
    @Bean("refreshValMs")
    Long refreshValidityMs(@Value("${jwt.refresh-token-validity-ms}")Long rMs){return rMs;}
}
