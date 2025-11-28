package com.example.backend.video;


import jakarta.annotation.PostConstruct;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.TimeZone;

@Entity
@Table(
        name = "videos",indexes = {
        @Index(name = "idx_videos_created_at",columnList = "created_at")
})
@Getter
@Setter
@ToString
@NoArgsConstructor  //매개변수가 없는 기본 생성자를 자동 생성 (JPA는 프록시 생성을 위해 기본 생성자가 꼭필요)
@AllArgsConstructor //모든 필드를 매개변수로 받는 생성자를 자동 생성한다. (보통 테스트나 샘플 객체를 만들 때 유용)
@Builder //필드가 많을 때 생성자의 인자 순서를 헷갈리지 않고 객체를 만들 수 있다.
public class Videos {

    //식별자.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) //Auto_Increment
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 200)
    private String tags;

    @Column(name = "storage_key",nullable = false,length = 512)
    private String storageKey;

    @Column(length = 512)
    private String url;

    @Column(name = "thumnail_key",length = 512)
    private String thumnailKey;

    @Column(name = "thumnail_url", length = 512)
    private String thumbnailUrl;

    @Column(name = "content_type" , length = 100)
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "duration_seconds")
    private Long durationSeconds;

    @Column(length = 128)
    private String etag;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.READY;

    @Column(name = "created_at",
    columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    insertable = false,updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at",
    columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public enum Status {
        PROCESSING , READY , FAILED
    }


}