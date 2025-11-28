package com.example.backend.video.search.repository;

import com.example.backend.video.search.doc.VideoDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface VideoDocumentRepository extends ElasticsearchRepository<VideoDocument,String> {
}
