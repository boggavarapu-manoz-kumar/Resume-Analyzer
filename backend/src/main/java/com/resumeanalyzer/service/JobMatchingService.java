package com.resumeanalyzer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class JobMatchingService {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public Map<String, Object> matchJobs(String resumeText) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("resume_text", resumeText);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                aiServiceUrl + "/match-jobs",
                HttpMethod.POST,
                req,
                Map.class
        );

        return response.getBody() != null ? response.getBody() : Map.of("matched_jobs", List.of());
    }
}
