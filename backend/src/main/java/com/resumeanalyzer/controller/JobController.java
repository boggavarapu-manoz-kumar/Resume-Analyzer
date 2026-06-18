package com.resumeanalyzer.controller;

import com.resumeanalyzer.service.JobMatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobMatchingService jobMatchingService;

    @PostMapping("/match")
    public ResponseEntity<Map<String, Object>> matchJobs(@RequestBody Map<String, String> body) {
        String resumeText = body.getOrDefault("resume_text", "");
        return ResponseEntity.ok(jobMatchingService.matchJobs(resumeText));
    }
}
