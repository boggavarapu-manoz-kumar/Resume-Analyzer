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
            @RequestParam(value = "experience_level", required = false) String experienceLevel,
            @RequestParam(value = "target_job", required = false) String targetJob,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {

        Map<String, Object> result = resumeService.uploadAndAnalyze(file, userDetails.getUsername(), jobDescription, experienceLevel, targetJob);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<Map<String, Object>> analyzeExistingResume(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {

        String jobDescription = payload != null ? payload.get("job_description") : null;
        String experienceLevel = payload != null ? payload.get("experience_level") : null;
        String targetJob = payload != null ? payload.get("target_job") : null;
        Map<String, Object> result = resumeService.analyzeExistingResume(id, userDetails.getUsername(), jobDescription, experienceLevel, targetJob);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/analyze-deep")
    public ResponseEntity<Map<String, Object>> analyzeDeep(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload) throws Exception {
        
        System.out.println("====== analyzeDeep called for resume ID: " + id + " ======");
        try {
            String targetJob = payload != null ? payload.get("target_job") : null;
            System.out.println("Target Job: " + targetJob);
            Map<String, Object> result = resumeService.analyzeDeep(id, targetJob);
            System.out.println("====== analyzeDeep SUCCESS ======");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("====== analyzeDeep FAILED ======");
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/my-resumes")
    public ResponseEntity<?> getMyResumes(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(resumeService.getUserResumes(userDetails.getUsername()));
    }
}
