package com.example.backend.auth;

import io.jsonwebtoken.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final Long accessValidityMs;
    private final Long refreshValidityMs;

    @Autowired
    public JwtUtil(@Qualifier("jwtSecretKey") SecretKey key,@Qualifier("accessValMs") Long accessValidityMs,@Qualifier("refreshValMs") Long refreshValidityMs) {
        this.key = key;
        this.accessValidityMs = accessValidityMs;
        this.refreshValidityMs = refreshValidityMs;
    }


    public String generateAccessToken(Long userId , String email)
    {
        return buildToken(userId, email,accessValidityMs);
    }

    public String generateRefreshToken(Long userId , String email)
    {
        return buildToken(userId, email,refreshValidityMs);
    }

    private String buildToken(Long userId, String email, long validity) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(email)
                .addClaims(Map.of("uid",userId))
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + validity))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parse(String token){
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
    }

    public boolean isValid(String token)
    {
        try {
            parse(token); return true;
        }catch (JwtException | IllegalArgumentException e )
        {
            return false;
        }
    }

    public String getEmail(String token){return parse(token).getBody().getSubject();}
    public Long getUserId(String token){Object v= parse(token).getBody().get("uid");
        return v == null ?null : Long.valueOf(v.toString());
    }

}
