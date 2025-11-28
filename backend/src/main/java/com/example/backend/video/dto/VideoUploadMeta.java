package com.example.backend.video.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
@Builder
public record VideoUploadMeta(
        @NotBlank
        String title,
        String description ,
        String tags ,
        String contentType,
        Long userId ) {
    public VideoUploadMeta withUser(Long uid){
        return VideoUploadMeta.builder()
                .title(this.title)
                .description(this.description)
                .tags(this.tags)
                .contentType(this.contentType)
                .userId(uid)
                .build();
    }
}
