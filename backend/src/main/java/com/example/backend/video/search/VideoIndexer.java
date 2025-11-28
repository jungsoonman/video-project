package com.example.backend.video.search;

import com.example.backend.video.Videos;

public interface VideoIndexer {
    void indexAsync(Videos v);
    void removeAsync(Long videoId);

}
