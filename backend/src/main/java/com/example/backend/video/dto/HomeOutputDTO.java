package com.example.backend.video.dto;


import com.example.backend.user.User;
import lombok.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeOutputDTO {
    Long videoID;
    String title;
    String thumbNailUrl;
    LocalDateTime created_at;
    String userName;
    String profileUrl;
    String duration;
    Long view;
}
