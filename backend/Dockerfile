#1단계 : Gradle로 빌드
FROM gradle:8.7-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle bootJar -x test

#2단계 : 경량 JRE 이미지로 실행
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]

# ffmpeg(=ffprobe) 설치 (+ tjsxor: tzdata)
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg tzdata \
  && rm -rf /var/lib/apt/lists/*

# (선택) 앱에서 명시적으로 참조하고 싶다면
ENV FFPROBE_PATH=/usr/bin/ffprobe
ENV TZ=Asia/Seoul

COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
