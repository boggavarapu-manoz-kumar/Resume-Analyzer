package com.resumeanalyzer.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component
public class FileUtil {

    private static final String UPLOAD_DIR = "uploads/resumes/";

    public String saveFile(MultipartFile file) throws IOException {
        // Ensure directory exists
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // Generate unique filename to prevent collisions
        String originalName = file.getOriginalFilename() != null
                ? file.getOriginalFilename()
                : "resume";
        String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf("."))
                : ".pdf";
        String uniqueName = UUID.randomUUID() + extension;

        Path targetPath = Paths.get(UPLOAD_DIR + uniqueName);
        Files.write(targetPath, file.getBytes());

        return targetPath.toString();
    }

    public void deleteFile(String path) {
        try {
            Files.deleteIfExists(Paths.get(path));
        } catch (IOException e) {
            // Log but don't throw
            System.err.println("Failed to delete file: " + path);
        }
    }
}
