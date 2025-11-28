package com.example.backend.video.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class VideoUtils {


    public static long getVideoDurationInSeconds(Path videoPath) {
        String ffprobe = System.getenv().getOrDefault("FFPROBE_PATH", "ffprobe");
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    ffprobe,
                    "-v", "error",
                    "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1",
                    videoPath.toString()
            );

            Process process = pb.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String durationStr = reader.readLine(); // e.g., "242.32132"
                if (durationStr != null) {
                    return Math.round(Double.parseDouble(durationStr)); // → 242초
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return 0L;
    }

    public static String fmtDateRel(LocalDateTime iso){


        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul")   );

        Duration duration = Duration.between(iso,now);
        long minutes = duration.toMinutes();

        if(minutes <60){
            return minutes + "분 전";
        }

        long hours = duration.toHours();

        if(hours < 24){
            return hours + "시간 전";
        }

        long days = duration.toDays()  ;
        return days +"일 전";


    }

    public static String formatDuration(Long seconds) {
        if (seconds == null) return "00:00";
        long h = seconds / 3600;
        long m = (seconds % 3600) / 60;
        long s = seconds % 60;

        if (h > 0)
            return String.format("%02d:%02d:%02d", h, m, s);
        else
            return String.format("%02d:%02d", m, s);
    }

    public static String guessExt(MultipartFile f) {
        String name = f.getOriginalFilename();
        if (name != null && name.contains(".")) {
            return name.substring(name.lastIndexOf('.')).toLowerCase();
        }
        return ".mp4";
    }
}
