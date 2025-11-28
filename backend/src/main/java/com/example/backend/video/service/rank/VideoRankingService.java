package com.example.backend.video.service.rank;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class VideoRankingService {

    private final StringRedisTemplate rt;


    /* 조회수 +1 , flush 대상 마킹 */
    public Long rankUP(Long videoId){

        Double score = rt.opsForZSet().incrementScore("video:rank", videoId.toString(), 1);
        return score.longValue(); // 총 점수(조회수)
    }

    public List<Long> top5Videos() {
        Set<String> top = rt.opsForZSet()
                .reverseRange("video:rank", 0, 4); // 점수 높은 순

        return top.stream()
                .map(Long::valueOf)
                .toList();
    }

    private String rankingKey(Long videoId){
        return "views:%d:ranking".formatted(videoId);
    }
}
