package com.example.backend.video.dto;


import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@Builder
public class WatchPageOutDTO {

    Long videoId;
    String title;
    String videoUrl;
    String durationSeconds;
    Long views;
    String createdAt;
    Long userId;
    String userName;
    String profileUrl;
    String description;
    String tags;


}
