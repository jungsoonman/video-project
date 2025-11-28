package com.example.backend.video;

import com.example.backend.video.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Configuration
@EnableScheduling
@RequiredArgsConstructor
@ConditionalOnProperty(value = "view.flush.enabled",havingValue = "true",matchIfMissing = true)
public class ViewFlushScheduler {

    private final RedisCounterService counters;
    private final StringRedisTemplate rt;
    private final VideoViewsRepository videoViewsRepository;

    @Scheduled(fixedDelay = 30_000)
    @Transactional
    public void flush(){

        //1) Redis 연결 헬스체크 (빠르게 실패하고 스킵)
        if(!isRedisAlive()){
            log.warn("[ViewFlush] Redis unreachable. Skip this cycle");
            return;
        }

        Set<String> dirtyIds;

        try {
            dirtyIds = rt.opsForSet().members("views:dirty");
        }catch (RedisConnectionFailureException e)
        {
            log.warn("[ViewFlush] Cannot fetch dirty set from Redis . Skip cause={}",e.getMessage());
            return;
        }

        if(dirtyIds == null || dirtyIds.isEmpty()) return;

        for (String idStr : dirtyIds) {
            Long id ;
            try{
                id = Long.valueOf(idStr);
            }catch (NumberFormatException nfe){
                log.warn("[ViewFlush] Invalid id in dirty set: {}", idStr);

                safeSRem("views:dirty",idStr);
                continue;
            }

            long delta = 0;
            try{
                //Redis 에 누적된 증가분을 원자적으로 꺼내오고 0으로 리셋하는 메서드(아래참고)
                delta =counters.getAndResetView(id);
                System.out.println("delta 값 :: " + delta);
            }catch (RedisConnectionFailureException e){
                log.warn("[ViewFlush] Cannot get/reset view delta for id ={}. Skip this id . cause={}",id,e.getMessage());
                continue;
            }

            if(delta <= 0){
                safeSRem("views:dirty", idStr);
                continue;
            }

            try {
                System.out.println("id : " + id +"\ndelta : " +delta);
                int rows = videoViewsRepository.incrementViews(id,delta);
                System.out.println("rows : " + rows);
                if(rows ==0){
                    //행이 없으면 (이상 케이스) 한번 만들어주고 재시도
                    videoViewsRepository.save(
                            VideoViews.builder()
                                    .videoId(id).views(0L).build()
                    );
                    videoViewsRepository.incrementViews(id,delta);
                }
                safeSRem("views:dirty",idStr);
            }catch (Exception e){
                log.warn("[ViewFlush] DB update failed id ={} delta={} - will retry. cause={}",id,delta,e.getMessage());
            }

        }


    }

    private void safeSRem(String s, String idStr) {
        try {
            rt.opsForSet().remove(s, idStr);
        }catch (Exception e){

        }
    }

    private boolean isRedisAlive() {
        try{
            // ping: 간단 ㅎ레스체크
            String pong = rt.execute((RedisCallback<String>) connection -> connection.ping());
            return "PONG".equalsIgnoreCase(pong);
        }catch (Exception e)
        {
            return false;
        }
    }


}
