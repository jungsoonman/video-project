package com.example.backend.video.dto;

import lombok.*;

@Getter@Setter@NoArgsConstructor@AllArgsConstructor@Builder
public class VideoSummaryDto{
        private Long id ;
        private String title;
        private String url;
        private String thumbnailUrl;

}
