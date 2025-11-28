package com.example.backend.video.service;

import org.springframework.web.multipart.MultipartFile;

public interface MinioService {
    String upload(MultipartFile file ,String bucketName);
    String publicUrl(String key ,String bucketName);
    void delete(String key ,String bucketName);
}
