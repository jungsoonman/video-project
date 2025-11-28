package com.example.backend.video.service;


import com.example.backend.user.UserService;
import com.example.backend.user.dto.UserResponse;
import com.example.backend.video.SortType;
import com.example.backend.video.VideoViews;
import com.example.backend.video.Videos;
import com.example.backend.video.auth.AuthContext;
import com.example.backend.video.dto.*;
import com.example.backend.video.search.VideoIndexer;
import com.example.backend.video.search.doc.VideoDocument;
import com.example.backend.video.search.repository.VideoDocumentRepository;
import com.example.backend.video.service.rank.VideoRankingService;
import lombok.RequiredArgsConstructor;
import org.hibernate.boot.model.process.internal.UserTypeResolution;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.*;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.example.backend.video.service.VideoUtils.*;
import static com.example.backend.video.service.VideoUtils.fmtDateRel;
import static com.example.backend.video.service.VideoUtils.guessExt;


@Service
@RequiredArgsConstructor
@Transactional
public class VideoServiceImpl implements VideoService{


    private final VideoRepository videoRepo;
    private final MinioService minio;
    private final RedisCounterService counters;
    private final VideoIndexer indexer;
    private final VideoViewsRepository viewRepo;
    private final AuthContext auth;
    //elasticSearch
    private final VideoDocumentRepository videoElaRepo;
    //user
    private final UserService userSvc;
    private final VideoRankingService rankSvc;




    @Override
    public VideoDto upload(MultipartFile file, VideoUploadMeta meta , MultipartFile thumbnail) {
        //간단 유효성
        if(file.isEmpty()) throw new IllegalArgumentException("empty file");
        if(meta.title() == null || meta.title().isBlank()) throw new IllegalArgumentException("title required");
        if(thumbnail.isEmpty() )throw new IllegalArgumentException("썸네일 사진이 없다 !!!! ");

        //1.확장자 결정
        String ext = guessExt(file);

        Path tempDir = Paths.get("./tmp/videos");

        try {
            Files.createDirectories(tempDir);

        }catch (IOException e) {
            throw new RuntimeException("임시 디렉터리 생성 실패: " + tempDir, e);
        }

        // 3) 임시 파일로 안전 저장 (transferTo 대신 copy 사용)
        Path tempFile = null;
        try (InputStream in = file.getInputStream()) {
            tempFile = Files.createTempFile(tempDir, "upload-", ext);
            Files.copy(in, tempFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("업로드 임시파일 저장 실패", e);
        }

        // 4) 존재 확인(중요)
        if (!Files.exists(tempFile)) {
            throw new IllegalStateException("임시파일이 존재하지 않습니다: " + tempFile.toAbsolutePath());
        }

        // 5) ffprobe로 길이 추출
        long duration = 0L;
        try {
            duration = getVideoDurationInSeconds(tempFile);
        } catch (Exception e) {
            // 실패해도 업로드는 진행하고 길이 0으로 저장하는 전략
            // (필요시 관리자 API로 재계산 가능)
            System.err.println("[WARN] duration 추출 실패: " + e.getMessage());
        } finally {
            // 6) 임시 파일 정리
            try { Files.deleteIfExists(tempFile); } catch (IOException ignore) {}
        }


        //1) storage
        String key = minio.upload(file ,"videos");
        String thumbnailKey = minio.upload(thumbnail , "thumbnail");

        //2) DB
        Videos v = Videos.builder()
                .userId(meta.userId())
                .title(meta.title())
                .description(meta.description())
                .tags(meta.tags())
                .storageKey(key)
                .contentType(meta.contentType())
                .thumnailKey(thumbnailKey)
                .sizeBytes(file.getSize())
                .status(Videos.Status.READY)
                .durationSeconds(duration)
                .build();



        v = videoRepo.save(v);

        //Elasticsearch 색인 저장.
        VideoDocument doc = VideoDocument.builder()
                .videoId(v.getId())
                .userId(meta.userId())
                .title(meta.title())
                .contentType(meta.contentType())
                .tags(meta.tags())
                .build();

        if(!viewRepo.existsById(v.getId()))
        {
            viewRepo.save(
                    VideoViews.builder().videoId(v.getId()).views(0L).build());


        }

        // 3) 색인(비동기 권장)
//        indexer.indexAsync(v);
        videoElaRepo.save(doc);
        return toDto(v);
    }

    @Override
    @Transactional(readOnly = true)
    public WatchPageOutDTO get(Long id)
    {
        Videos v = videoRepo.findById(id).orElseThrow();

        String videosUrl = minio.publicUrl(v.getStorageKey(), "videos");

        Optional<VideoViews> viewInfo = viewRepo.findById(v.getId());

        String str_createdAt = fmtDateRel(v.getCreatedAt());

        String str_durations = formatDuration(v.getDurationSeconds());


        UserResponse userInfo = userSvc.getById(v.getUserId());
        String profileUrl = minio.publicUrl(userInfo.profileKey(), "profile");




        return  WatchPageOutDTO.builder()
                .videoId(v.getId())
                .title(v.getTitle())
                .videoUrl(videosUrl)
                .durationSeconds(str_durations)
                .views(viewInfo.get().getViews())
                .createdAt(str_createdAt)
                .userId(userInfo.id())
                .userName(userInfo.name())
                .profileUrl(profileUrl)
                .description(v.getDescription())
                .tags(v.getTags())
                .build();
    }

    @Override
    public List<HomeOutputDTO> list(List<Long> ids) {


        Map<Long, Long> viewVideoId = viewRepo.findAllById(ids).stream()
                .collect(Collectors.toMap(
                        VideoViews::getVideoId,
                        VideoViews::getViews
                ));


        return ids.stream()
                .map(videoRepo::findById)
                .flatMap(Optional::stream)
                .map(v->{
                    UserResponse ur = userSvc.getById(v.getUserId());
                    String profileUrl = minio.publicUrl(ur.profileKey(),"profile");
                    String thumbNailUrl = minio.publicUrl(v.getThumnailKey() ,"thumbnail");

                    long views = viewVideoId.getOrDefault(v.getId(),0L);
                    String str_duration = formatDuration(v.getDurationSeconds());

                    return
                            HomeOutputDTO.builder()
                                    .videoID(v.getId())
                                    .title(v.getTitle())
                                    .thumbNailUrl(thumbNailUrl)
                                    .created_at(v.getCreatedAt())
                                    .userName(ur.name())
                                    .profileUrl(profileUrl)
                                    .duration(str_duration)
                                    .view(views)
                                    .build();

                }).toList();





    }

    @Override
    @Transactional(readOnly = true)
    public Page<HomeOutputDTO> list(org.springframework.data.domain.Pageable pageable, SortType sort) {
        Pageable p = withSort(pageable, sort);

        Page<Videos> page = videoRepo.findAll(p);

        // 1) views를 한 번에 조회해 Map으로 변환
        List<Long> ids = page.map(Videos::getId).getContent();
        Map<Long , Long> viewVideoId= viewRepo.findAllById(ids).stream()
                .collect(Collectors.toMap(
                        VideoViews::getVideoId,
                        VideoViews::getViews
                ));

        // 2) Page<Videos> -> Page<HomeOutputDTO>
        return page.map(v -> {
            // 사용자 정보 (서비스/레포 중 하나로 일관되게)
            UserResponse ur = userSvc.getById(v.getUserId());
            String profileUrl = minio.publicUrl(ur.profileKey(), "profile");
            String thumbNailUrl = minio.publicUrl(v.getThumnailKey(), "thumbnail");

            long views = viewVideoId.getOrDefault(v.getId(), 0L);
            String str_duration = formatDuration(v.getDurationSeconds());

            return HomeOutputDTO.builder()
                    .videoID(v.getId())
                    .title(v.getTitle())
                    .thumbNailUrl(thumbNailUrl)
                    .created_at(v.getCreatedAt())
                    .userName(ur.name())
                    .profileUrl(profileUrl)
                    .duration(str_duration)
                    .view(views)
                    .build();
        });
    }



    @Override
    public ResponseEntity<Long> incrementView(Long videoId) {
        Long v = counters.incrView(videoId);
        rankSvc.rankUP(videoId);
        return ResponseEntity.ok(v);
    }

    @Override
    public void delete(Long id, Long requesterId) {
        Videos v = videoRepo.findById(id).orElseThrow();
        if (requesterId == null || !v.getUserId().equals(requesterId)){
            throw new AccessDeniedException("owner only");
        }
        minio.delete(v.getStorageKey() ,"videos");
        videoRepo.deleteById(id);
        // 실제 파일 삭제는 운영 정책에 맞춰 소프트 / 배치로 권장
        indexer.removeAsync(id);
    }





    private Pageable withSort(Pageable pageable, SortType sort){
        Sort s =switch (sort){
            case LATEST -> Sort.by(Sort.Direction.DESC, "createdAt");
            case OLDEST -> Sort.by(Sort.Direction.ASC, "createdAt");
            case POPULAR -> Sort.by(Sort.Direction.DESC, "viewCount").and(Sort.by("id").descending());
        };
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),s );
    }

    private VideoDto toDto(Videos v){
        return VideoDto.builder()
                .id(v.getId())
                .userId(v.getUserId())
                .title(v.getTitle())
                .description(v.getDescription())
                .tags(v.getTags())
                .url(v.getUrl())
                .thumbnailKey(v.getThumnailKey())
                .contentType(v.getContentType())
                .sizeBytes(v.getSizeBytes())
                .status(v.getStatus().name())
                .build();
    }

    private VideoSummaryDto toSummary(Videos v){
        return VideoSummaryDto.builder()
                .id(v.getId())
                .title(v.getTitle())
                .url(v.getUrl())
                .thumbnailUrl(v.getThumbnailUrl())
                .build();
    }




}
