package com.example.backend.video.dto;

public record FinalizeUploadRequest(
        String storageKey , String publicUrl , String title , String description , String tags,
        Long size , String contentType , Integer durationSeconds
) {
}
