package com.example.backend.video.dto;

import lombok.*;

@Getter@Setter@NoArgsConstructor@AllArgsConstructor@Builder
public class VideoDto{
        private Long id ;
        private Long userId;
        private String title ;
        private String description;
        private String url ;
        private String thumbnailKey;
        private String tags;
        private String contentType;
        private Long sizeBytes;
        private Integer durationSeconds;
        private String status;

}
