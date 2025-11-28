package com.example.backend.video;

import com.example.backend.auth.CustomUserDetails;
import com.example.backend.video.dto.*;
import com.example.backend.video.search.repository.VideoDocumentRepository;
import com.example.backend.video.search.service.VideoSearchService;
import com.example.backend.video.service.VideoService;
import com.example.backend.video.service.VideoServiceImpl;
import com.example.backend.video.service.rank.VideoRankingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Slf4j
@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

    private final VideoSearchService searchRepo;

    private final VideoRankingService rankSvc;
    /*
    * 비디오 업로드
    * */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public VideoDto upload(
            @RequestPart(value = "file" ,required = false)MultipartFile file,
            @Valid @RequestPart("meta")VideoUploadMeta meta,
            //썸네일 추가하기
            @RequestPart(value = "thumbnail" , required = false)MultipartFile thumbnail,
            @AuthenticationPrincipal CustomUserDetails me
            ) throws IOException {

//        if (me == null) {
//            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 필요");
//        }

        Long uid = (me != null) ? me.getId() : 0L; //데모용
        log.info("upload file name={},siz={}, bytes",file!= null?file.getOriginalFilename():"null",file != null? file.getSize():-1);
        return videoService.upload(file, meta.withUser(uid) , thumbnail);
    }

    @GetMapping("/{id}")
    public WatchPageOutDTO get(@PathVariable Long id){ return videoService.get(id);}

    @GetMapping("/ranking")
    public List<HomeOutputDTO> rankList(){

        List<Long> longs = rankSvc.top5Videos();

        System.out.println("longs = " + longs);

        return videoService.list(longs);


    }



    @GetMapping
    public Page<HomeOutputDTO> list(@PageableDefault(size = 20)Pageable pageable,
                                      @RequestParam(defaultValue = "LATEST") SortType sort){
        return videoService.list(pageable, sort);
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Long> view(@PathVariable Long id){
        ResponseEntity<Long> result = videoService.incrementView(id);
        return result;
    }


    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id , @AuthenticationPrincipal CustomUserDetails me){
        Long uid = (me != null) ? me.getId() : null;
        videoService.delete(id, uid);
    }


    @GetMapping("/search")
    public Page<SearchPageOutDTO> searchVideos(
            @RequestParam String query,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String contentType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5")int size
    ){
       return searchRepo.searchVideo(
                query,
                tags,
                contentType,
                page,
                size
        );
    }

    @GetMapping("/autoComplete")
    public List<String> autoComplete(
            @RequestParam String query
    ){
        return searchRepo.getSuggestions(query);
    }
}
