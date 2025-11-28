package com.example.backend.video;

import jakarta.persistence.*;
import lombok.*;
import org.checkerframework.dataflow.qual.Pure;
import org.jetbrains.annotations.Contract;

import java.time.Instant;

@Entity
@Table(name = "video_views")
@Getter@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoViews {

    @Id
    @Column(name = "video_id")
    private Long videoId;

    @Column(nullable = false)
    private long views  = 0L;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist(){
        this.updatedAt=Instant.now();
    }

    @PreUpdate
    public void preUpdate(){
        this.updatedAt = Instant.now();
    }
}
