package com.resumeanalyzer.controller;

import com.resumeanalyzer.service.JobMatchingService;
import com.resumeanalyzer.service.RealTimeJobSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobMatchingService jobMatchingService;
    private final RealTimeJobSearchService realTimeJobSearchService;

    @PostMapping("/match")
    public ResponseEntity<Map<String, Object>> matchJobs(@RequestBody Map<String, String> body) {
        String resumeText = body.getOrDefault("resume_text", "");
        return ResponseEntity.ok(jobMatchingService.matchJobs(resumeText));
    }

    @PostMapping("/realtime-match")
    public ResponseEntity<Map<String, Object>> realtimeMatchJobs(@RequestBody Map<String, String> body) {
        String resumeText = body.getOrDefault("resume_text", "");
        List<Map<String, Object>> results = realTimeJobSearchService.searchDynamicJobs(resumeText);
        return ResponseEntity.ok(Map.of("matched_jobs", results));
    }
}
