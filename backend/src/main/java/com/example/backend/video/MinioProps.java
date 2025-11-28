package com.example.backend.video;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@ConfigurationProperties(prefix="minio")
@Getter
@Setter
public class MinioProps {

    private String endpointInternal;
    private String endpointPublic;
    private String accessKey;
    private String secretKey;
    private Map<String , String> buckets;
    private String publicBaseUrl;


}
