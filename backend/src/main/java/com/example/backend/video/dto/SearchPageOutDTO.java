package com.example.backend.video.dto;


import lombok.*;

@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@Builder
public class SearchPageOutDTO {

    Long videoId;
    String title;
    String thumbNailUrl;
    String durationSeconds;
    Long views;
    String createdAt;
    Long userId;
    String userName;
    String profileUrl;
    String tags;
}
