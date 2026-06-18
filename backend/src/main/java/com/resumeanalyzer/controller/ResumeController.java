package com.resumeanalyzer.controller;

import com.resumeanalyzer.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "job_description", required = false) String jobDescription,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {

        Map<String, Object> result = resumeService.uploadAndAnalyze(file, userDetails.getUsername(), jobDescription);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<Map<String, Object>> analyzeExistingResume(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {

        String jobDescription = payload != null ? payload.get("job_description") : null;
        Map<String, Object> result = resumeService.analyzeExistingResume(id, userDetails.getUsername(), jobDescription);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/my-resumes")
    public ResponseEntity<?> getMyResumes(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(resumeService.getUserResumes(userDetails.getUsername()));
    }
}
