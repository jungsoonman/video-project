package com.example.backend.video.search;

import com.example.backend.video.Videos;
import org.springframework.stereotype.Component;

@Component
public class NoopVideoIndexer implements VideoIndexer{
    @Override
    public void indexAsync(Videos v) {


    }

    @Override
    public void removeAsync(Long videoId) {

    }
}
