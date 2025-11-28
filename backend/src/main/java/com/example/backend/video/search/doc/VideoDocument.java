package com.example.backend.video.search.doc;

import jakarta.persistence.PrePersist;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

import java.time.LocalDateTime;

@Document(indexName = "videos")
@Setting(settingPath = "/elasticsearch/video-setting.json")
@Getter@Setter@Builder
public class VideoDocument {

    @Id
    private String id;

    @Field(type = FieldType.Long)
    private Long userId;

    @Field(type = FieldType.Long)
    private Long videoId;

    @MultiField(mainField = @Field(type = FieldType.Text,analyzer = "videos_title_analyzer"),
    otherFields = {
            @InnerField(suffix = "auto_complete",type = FieldType.Search_As_You_Type, analyzer = "nori")
//            실제 ES 필드명은 "name.auto_complete"
    })
    private String title;

    @Field(type = FieldType.Keyword)
    private String tags;

    @Field(type = FieldType.Keyword)
    private String contentType;

    @Field(type = FieldType.Date , format = DateFormat.date_time)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
