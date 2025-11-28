package com.example.backend.video.service.rank;


import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class VideoRankScheduler {


    private final StringRedisTemplate rt;

    /*
    * 매일 오전 9시 (한국 시간)에 랭킹 초기화
    * */
    @Scheduled(cron = "0 0 9 * * *", zone="Asia/Seoul")
    public void resetDailyRank(){
        rt.delete("video:rank");
        System.out.println("삭제 완료;;");

    }


}
