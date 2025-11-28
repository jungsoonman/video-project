package com.example.backend.video.auth;

import com.example.backend.auth.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Component;

@Component
public class AuthContext {
    public Long currentUserId(@AuthenticationPrincipal CustomUserDetails me){
        return me == null? null :me.getId();
    }
}
