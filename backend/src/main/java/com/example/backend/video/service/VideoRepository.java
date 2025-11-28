package com.example.backend.video.service;

import com.example.backend.video.Videos;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoRepository extends JpaRepository<Videos, Long> {
    List<Videos> findByUserId(Long userId);
    List<Videos> findByStatus(Videos.Status status);

}
