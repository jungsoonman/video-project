# 1단계: Gradle 빌드 (캐시 최적화, wrapper 없음 버전)
FROM gradle:8.7-jdk17 AS build
WORKDIR /app

# (1) 의존성 관련 파일만 먼저 복사
#    - 여기 있는 파일만 복사해서, 의존성 레이어를 분리
COPY build.gradle* settings.gradle* gradle.properties* ./

# (2) 의존성 다운로드 & 캐시 채우기
#    - build 실패해도 의존성 캐시만 남으면 되니까 || true
RUN gradle --no-daemon build -x test || true

# (3) 실제 소스 코드 복사
COPY src ./src

# (4) 최종 bootJar 빌드
RUN gradle --no-daemon bootJar -x test


# 2단계: 경량 JRE + ffmpeg 런타임 이미지
FROM eclipse-temurin:17-jre
WORKDIR /app

# ffmpeg + tzdata 설치
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg tzdata \
  && rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Seoul
ENV FFPROBE_PATH=/usr/bin/ffprobe

# 빌드 단계에서 만든 JAR 복사
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
