# 1단계: Gradle 빌드 (캐시 최적화)
FROM gradle:8.7-jdk17 AS build
WORKDIR /app

# (1) 의존성 관련 파일만 먼저 복사
COPY build.gradle* settings.gradle* gradle.properties* ./
COPY gradle ./gradle
COPY gradlew ./

# (2) 의존성 다운로드 & Gradle 캐시 채우기 (가장 중요한 변경)
# 소스 코드 없이 의존성만 다운로드하여 캐시를 생성합니다.
RUN ./gradlew --no-daemon dependencies

# (3) 실제 소스 코드 복사
COPY src ./src

# (4) 최종 bootJar 빌드
RUN ./gradlew --no-daemon bootJar -x test


# 2단계: 경량 JRE + ffmpeg 런타임 이미지
# 더 작은 slim 버전을 사용합니다.
FROM eclipse-temurin:17-jre-slim
WORKDIR /app

# ffmpeg + tzdata 설치 및 캐시 정리
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg tzdata \
  && rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Seoul
ENV FFPROBE_PATH=/usr/bin/ffprobe

# 빌드 단계에서 만든 JAR 복사 (JAR 이름을 명시하는 것을 권장)
# JAR 파일 이름이 'my-app.jar'이라고 가정합니다.
COPY --from=build /app/build/libs/my-app.jar app.jar
# 만약 파일 이름이 빌드마다 바뀐다면 원래대로 *.jar 사용:
# COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
