package com.example.backend.video.service;

import com.example.backend.video.SortType;
import com.example.backend.video.Videos;
import com.example.backend.video.dto.*;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface VideoService {
    VideoDto upload(MultipartFile file , VideoUploadMeta meta ,MultipartFile thumbnail) throws IOException;
    WatchPageOutDTO get(Long id);
    Page<HomeOutputDTO> list(Pageable pageable , SortType sort);
    ResponseEntity<Long> incrementView(Long videoId);       // Redis INCR -> 배치 반영
    List<HomeOutputDTO> list(List<Long> ids);

    void delete(Long id , Long requesterId); //소유자 /관리자만 허용
}
