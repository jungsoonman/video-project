package com.example.backend.video.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisCounterService {

    private final StringRedisTemplate rt;

    /* 조회수 +1 , flush 대상 마킹 */
    public Long incrView(Long videoId){
        Long newVal = rt.opsForValue().increment(deltakey(videoId));
        rt.opsForSet().add("views:dirty", String.valueOf(videoId)); //flush 대상 추첮
        log.info("🔹 INCR {} -> {}", deltakey(videoId), newVal);
        return newVal;
    }

    // 증분값(delta)을 가져오고 0으로 리셋
    public Long getAndResetView(Long videoId){

        String prev = rt.opsForValue().getAndSet(deltakey(videoId),"0");
        if(prev == null) return 0L;
        try {
            return Long.parseLong(prev);
        }catch (NumberFormatException e){
            rt.opsForValue().set(deltakey(videoId),"0");
            return 0L;
        }
    }


    private String deltakey(Long videoId) {
        return "views:%d:delta".formatted(videoId);
    }

}
