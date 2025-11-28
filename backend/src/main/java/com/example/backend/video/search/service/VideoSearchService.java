package com.example.backend.video.search.service;

import co.elastic.clients.elasticsearch._types.query_dsl.*;
import com.example.backend.user.UserService;
import com.example.backend.user.dto.UserResponse;
import com.example.backend.video.VideoViews;
import com.example.backend.video.Videos;
import com.example.backend.video.dto.SearchPageOutDTO;
import com.example.backend.video.dto.WatchPageOutDTO;
import com.example.backend.video.search.doc.VideoDocument;
import com.example.backend.video.search.repository.VideoDocumentRepository;
import com.example.backend.video.service.MinioService;
import com.example.backend.video.service.VideoRepository;
import com.example.backend.video.service.VideoUtils;
import com.example.backend.video.service.VideoViewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.HighlightQuery;
import org.springframework.data.elasticsearch.core.query.highlight.Highlight;
import org.springframework.data.elasticsearch.core.query.highlight.HighlightField;
import org.springframework.data.elasticsearch.core.query.highlight.HighlightParameters;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoSearchService {

    private final VideoDocumentRepository repo;
    private final ElasticsearchOperations elasticsearchOperations;
    private final VideoRepository videoRepo;
    private final UserService userSvc;
    private final MinioService minio;
    private final VideoViewsRepository viewrepo;

    public List<String> getSuggestions(String query){
        Query multiMatchQuery = MultiMatchQuery.of(m->
                m.query(query)
                        .type(TextQueryType.BoolPrefix)
                        .fields("title.auto_complete","title.auto_complete._2gram"
                        ,"title.auto_complete._3gram")
                        )._toQuery();
        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(multiMatchQuery)
                .withPageable(PageRequest.of(0,5))
                .build();

        SearchHits<VideoDocument> searchHits
                = this.elasticsearchOperations.search(nativeQuery,VideoDocument.class);

        return searchHits.getSearchHits().stream()
                .map(hit ->{
                    VideoDocument videoDocument = hit.getContent();
                    return videoDocument.getTitle();
                })
                .toList();
    }

    public Page<SearchPageOutDTO> searchVideo(String query , String tags, String contentType, int page, int size){

        Query multiMatchQuery = MultiMatchQuery.of(m->m
                .query(query)
                .fields("title^3","description^1","contentType^1")
                .fuzziness("AUTO"))._toQuery();

        List<Query> filters = new ArrayList<>();

        if(tags != null && !tags.isEmpty()){
            Query tagFilter = TermQuery.of(t->t
                    .field("tags")
                    .value(tags))._toQuery();
            filters.add(tagFilter);
        }

        if(contentType != null && !contentType.isEmpty()){
            Query contentFilter = TermQuery.of(f->f
                    .field("contentType")
                    .value(contentType))._toQuery();

            filters.add(contentFilter);
        }

        Query boolQuery = BoolQuery.of(b->b
                .must(multiMatchQuery)
                .filter(filters))._toQuery();

        HighlightParameters highlightParameters = HighlightParameters.builder()
                .withPreTags("<b>")
                .withPostTags("</b>")
                .build();
        Highlight highlight = new Highlight(highlightParameters , List.of(new HighlightField("title")));

        HighlightQuery highlightQuery = new HighlightQuery(highlight, VideoDocument.class);

        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(boolQuery)
                .withHighlightQuery(highlightQuery)
                .withPageable(PageRequest.of(page-1, size))
                .build();

        //1). ES 검색
        SearchHits<VideoDocument> hits = this.elasticsearchOperations.search(
                nativeQuery,
                VideoDocument.class
        );

        //2). ES 검색 결과에서 VideoId 추출 + 순서 보존
        List<Long> idsInOrder = hits.getSearchHits().stream()
                .map(h->h.getContent().getVideoId())
                .toList();

        //3). 유에서 엔티티 조회
        List<Videos> videos = videoRepo.findAllById(idsInOrder);

        //4). ES 점수 순서로 재정렬
        Map<Long,Integer> orderMap = new HashMap<>();
        for (int i =0; i < idsInOrder.size(); i++){
            orderMap.put(idsInOrder.get(i),i);
        }

        videos.sort(Comparator.comparingInt(p->orderMap.getOrDefault(p.getId(),Integer.MAX_VALUE)));

        List<Long> ids  = videos.stream().map(Videos::getId).toList();
        Map<Long , Long> viewVideoId = viewrepo.findAllById(ids).stream()
                        .collect(Collectors.toMap(
                                VideoViews::getVideoId,
                                v->v.getViews()
                        ));

        Map<Long, UserResponse> userCache = new HashMap<>();
        Map<Long, String> profileCache   = new HashMap<>();
        List<SearchPageOutDTO> list = videos.stream().map(v -> {

//            UserResponse ur = userSvc.getById(v.getUserId());
            // 유저 정보 캐시
            UserResponse ur = userCache.computeIfAbsent(v.getUserId(), id -> userSvc.getById(id));

            // 프로필 URL 캐시
            String profileurl = profileCache.computeIfAbsent(v.getUserId(),id->minio.publicUrl(ur.profileKey(),"profile"  ));

//            String profileurl = minio.publicUrl(ur.profileKey(), "profile");
            String thumbnailUrl = minio.publicUrl(v.getThumnailKey(), "thumbnail");

            long views = viewVideoId.getOrDefault(v.getId(), 0L);
            String str_duration = VideoUtils.formatDuration(v.getDurationSeconds());
            String str_craat = VideoUtils.fmtDateRel(v.getCreatedAt());

            return SearchPageOutDTO.builder()
                    .videoId(v.getId())
                    .title(v.getTitle())
                    .thumbNailUrl(thumbnailUrl)
                    .durationSeconds(str_duration)
                    .views(views)
                    .createdAt(str_craat)
                    .userId(v.getUserId())
                    .userName(ur.name())
                    .profileUrl(profileurl)
                    .tags(v.getTags())
                    .build();
        }).toList();

        return new PageImpl<>(list );
    }

}
