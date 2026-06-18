package com.resumeanalyzer.controller;

import com.resumeanalyzer.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/generate-questions")
    public ResponseEntity<Map<String, Object>> generateQuestions(@RequestBody Map<String, Object> body) {
        List<String> skills = (List<String>) body.getOrDefault("skills", List.of());
        String experience = (String) body.getOrDefault("experience", "2 years");
        return ResponseEntity.ok(interviewService.generateQuestions(skills, experience));
    }

    @PostMapping("/evaluate")
    public ResponseEntity<Map<String, Object>> evaluateInterview(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Map<String, String>> transcript = (List<Map<String, String>>) body.get("transcript");
        return ResponseEntity.ok(interviewService.evaluateInterview(userDetails.getUsername(), transcript));
    }

    @PostMapping("/career-guidance")
    public ResponseEntity<Map<String, Object>> careerGuidance(@RequestBody Map<String, Object> body) {
        String currentRole = (String) body.getOrDefault("current_role", "Developer");
        String targetRole = (String) body.getOrDefault("target_role", "Senior Developer");
        List<String> skills = (List<String>) body.getOrDefault("skills", List.of());
        return ResponseEntity.ok(interviewService.getCareerGuidance(currentRole, targetRole, skills));
    }
}
