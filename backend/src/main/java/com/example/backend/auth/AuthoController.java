package com.example.backend.auth;

import com.example.backend.auth.dto.LoginRequest;
import com.example.backend.auth.dto.TokenResponse;
import com.example.backend.user.User;
import com.example.backend.user.UserJpaRepository;
import io.jsonwebtoken.Claims;
import io.minio.credentials.Jwt;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;

@Slf4j
@Profile("jpa")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Transactional
public class AuthoController {

    private final AuthenticationManager authManager;
    private final JwtUtil jwt;
    private final UserJpaRepository userRepo;
    private final RefreshTokenRepository refreshRepo;
    private final PasswordEncoder encoder;
    private final StringRedisTemplate rtt;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")

    public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest req)
    {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        //여기 오면 비번 검증 통과
        User user = userRepo.findByEmail(req.email()).orElseThrow();

        String access = jwt.generateAccessToken(user.getId(), user.getEmail());
        String refresh = jwt.generateRefreshToken(user.getId(), user.getEmail());

        // DB 저장(로그아웃/재발급 대비)
        refreshRepo.deleteByUserId(user.getId()); //기존 리프레시 무효화

        //레디스에 있는 값도 지우는 로직 추가 필요.[start]
        rtt.delete(refreshKey(user.getId()));
        //레디스에 있는 값도 지우는 로직 추가 필요.[end]



        //레디스에 리프레시 토큰 값 저장  로직 추가 필요.[start] 7일 자동 삭제..
        rtt.opsForValue().set(refreshKey(user.getId()),refresh , Duration.ofDays(7));
        //레디스에 리프레시 토큰 값 저장  로직 추가 필요.[end]

        //DB에 저장하는 로직.  ====[start] 현재시 + 7일.
        refreshRepo.save(new RefreshToken(user.getId(), refresh,
                Instant.ofEpochMilli(System.currentTimeMillis() +604800000L)));
        //DB에 저장하는 로직.  ====[end]

        // HttpOnly 쿠키에 refresh 보과(프로트가 JS로 읽지 못하게)
        ResponseCookie cookie = ResponseCookie.from("refresh_token",refresh)
                .httpOnly(true).secure(false) //프로덕션은 true + SameSite 설정
                .path("/api/auth").maxAge(7*24*3600).build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(TokenResponse.bearer(access , 900000));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@CookieValue(name = "refresh_token", required = false) String refreshCookie,
                                                 @RequestHeader(value = "X-Refresh-Token",required = false) String refreshHeader){

        System.out.println("===Refresh 진입 ===");
        System.out.println("refreshCookie : " + refreshCookie   );
        System.out.println("refreshHeader = " + refreshHeader);
        String refresh = refreshCookie != null ? refreshCookie : refreshHeader;
        if (refresh == null || !jwt.isValid(refresh)) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();


//        var rt = refreshRepo.findByToken(refresh).orElse(null);
        final Claims body;
        try{
            body = jwtUtil.parse(refresh).getBody();
        }catch (io.jsonwebtoken.JwtException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).header("X-Error-Code","jwt-connet-fail").build();
        }
        System.out.println("body = " + body.toString());

        long uid = body.get("uid", Number.class).longValue();

        System.out.println("==email 가져가는 시작 ====");
        String email = body.get("sub", String.class).toString();
        System.out.println("email = " + email);

        final String confirmKey = refreshKey(uid);
        String redisInRefresh = rtt.opsForValue().get(confirmKey);
        if(redisInRefresh == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).header("X-Error-Code", "refresh_not_found").build();
        }

        if(!refresh.equals(redisInRefresh)){
            rtt.delete(confirmKey);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).header("X-Error-Code", "refresh_reuse_detected").build();
        }


//        Long uid = jwt.getUserId(refresh);
//        User user = userRepo.findById(uid).orElseThrow();

        String newAccess = jwt.generateAccessToken(uid, email);
        return ResponseEntity.ok(TokenResponse.bearer(newAccess,900000));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = "refresh_token",required = false) String refresh){

        if(refresh != null) refreshRepo.deleteByToken(refresh);
        ResponseCookie clear = ResponseCookie.from("refresh_token","")
                .httpOnly(true).secure(false).path("/api/auth").maxAge(0).build();

        final Claims body;
        try{
            body = jwtUtil.parse(refresh).getBody();
        }catch (io.jsonwebtoken.JwtException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).header("X-Error-Code","jwt-connet-fail").build();
        }
        long uid = body.get("uid", Long.class).longValue();
        //레디스에 있는 값도 지우는 로직 추가 필요.[start]
        rtt.delete(refreshKey(uid));
        //레디스에 있는 값도 지우는 로직 추가 필요.[end]
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE,clear.toString()).build();
    }

    private boolean isRedisAlive() {
        try{
            // ping: 간단 ㅎ레스체크
            String pong = rtt.execute((RedisCallback<String>) connection -> connection.ping());
            return "PONG".equalsIgnoreCase(pong);
        }catch (Exception e)
        {
            return false;
        }
    }

    private String refreshKey(Long userId){
        return "User-Agent:%d:key".formatted(userId);
    }




}
