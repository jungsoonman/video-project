package com.example.backend.io.minio;

import ch.qos.logback.classic.Logger;
import com.example.backend.video.MinioProps;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.errors.ErrorResponseException;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/files")
public class FileController {

    private final MinioClient minioInternalClient;
    private final MinioClient minioPublicPresignClient; //위에서 만든 public Bean 주입
    private final MinioProps props;

    //짧게(예:10분) 유효한 URL 발급
    @GetMapping("/urlGet/{key:.+}/presigned")
    public Map<String, String> presign(@PathVariable String key) {
        final String bucket = props.getBuckets().get("profile"); // 실제값 예: "profiles"
        if (bucket == null || bucket.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "bucket_not_configured");
        }
        if (key == null || key.isBlank() || key.startsWith("/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "bad_key");
        }

        // 존재 확인은 internal로 (네트워크 호출 OK)
        try {
            minioInternalClient.statObject(
                    io.minio.StatObjectArgs.builder().bucket(bucket).object(key).build()
            );
        } catch (io.minio.errors.ErrorResponseException e) {
            final String code = e.errorResponse().code();
            if ("NoSuchKey".equalsIgnoreCase(code)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "object_not_found", e);
            }
            if ("NoSuchBucket".equalsIgnoreCase(code)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "bucket_not_found", e);
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "minio_error:"+code, e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "stat_error:"+e.getClass().getSimpleName()+":"+e.getMessage(), e);
        }

        // URL 서명은 public로 (네트워크 호출 없음)
        try {
            String url = minioPublicPresignClient.getPresignedObjectUrl(
                    io.minio.GetPresignedObjectUrlArgs.builder()
                            .method(io.minio.http.Method.GET)
                            .bucket(bucket)
                            .object(key)
                            .expiry(70) // 1~604800
                            .build()
            );
            return Map.of("url", url);
        } catch (IllegalArgumentException e) {
            // 잘못된 endpoint/버킷/오브젝트/expiry 등
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "bad_argument:"+e.getMessage(), e);
        } catch (Exception e) {
            // ★원인 그대로 노출 (더 이상 '알수없는 오류' 금지)
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "presign_error:"+e.getClass().getSimpleName()+":"+e.getMessage(), e);
        }
    }


}
