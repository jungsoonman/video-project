package com.example.backend.video.service;

import com.example.backend.video.VideoViews;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoViewsRepository extends JpaRepository<VideoViews, Long> {

    @Modifying(clearAutomatically = true,flushAutomatically = true)
    @Query("update VideoViews v set v.views = v.views + :delta where v.videoId = :id")
    int incrementViews(@Param("id") Long id, @Param("delta") Long delta);

    boolean existsById(Long id);
}
