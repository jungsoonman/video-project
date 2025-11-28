package com.example.backend.video.service;

import com.example.backend.video.MinioProps;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioServiceImpl implements MinioService{

    private final MinioClient minioPublicPresignClient; //위에서 만든 public Bean 주입
    private final MinioClient minioInternalClient;
    private final MinioProps props;

    @Override
    public String upload(MultipartFile file, String bucketName) {

        try(InputStream in = file.getInputStream()){


            String key = UUID.randomUUID() + "-" + file.getOriginalFilename();

            log.info("before minio putObject: key={} , size={}",key, file.getSize());

            minioInternalClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(key)
                            .stream(in, file.getSize() , -1)
                            .contentType(file.getContentType())
                            .build()

            );
            return key;

        }catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String publicUrl(String key ,String bucketName) {
        // 퍼블릭 버킷이면 정적 URL , 아니면 PreSigned GET
        if (props.getPublicBaseUrl() != null && !props.getPublicBaseUrl().isBlank()){
            return props.getPublicBaseUrl()  + "/" + key;
        }
        try{
            return minioPublicPresignClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .bucket(bucketName)
                            .object(key)
                            .method(Method.GET)
                            .build()
            );
        }catch (Exception e)
        {
            throw new RuntimeException(e);
        }

    }

    @Override
    public void delete(String key ,String bucketName) {

        try{
            minioInternalClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(key)
                    .build());
        }catch (Exception e)
        {
            throw new RuntimeException(e);
        }

    }
}
