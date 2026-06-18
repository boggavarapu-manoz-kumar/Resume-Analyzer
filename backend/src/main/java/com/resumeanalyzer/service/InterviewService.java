package com.resumeanalyzer.service;

import com.resumeanalyzer.entity.Interview;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.repository.InterviewRepository;
import com.resumeanalyzer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public Map<String, Object> generateQuestions(List<String> skills, String experience) {
        Map<String, Object> body = new HashMap<>();
        body.put("skills", skills);
        body.put("experience", experience);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                aiServiceUrl + "/generate-questions",
                HttpMethod.POST, req, Map.class
        );
        return response.getBody() != null ? response.getBody() : Map.of();
    }

    public Map<String, Object> evaluateInterview(String userEmail, List<Map<String, String>> transcript) {
        Map<String, Object> body = new HashMap<>();
        body.put("transcript", transcript);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                aiServiceUrl + "/evaluate-interview",
                HttpMethod.POST, req, Map.class
        );

        Map<String, Object> result = response.getBody() != null ? response.getBody() : Map.of();

        // Persist interview record
        try {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Integer score = result.containsKey("score") ? (Integer) result.get("score") : 0;
            String feedback = result.containsKey("feedback") ? result.get("feedback").toString() : "";

            Interview interview = Interview.builder()
                    .user(user)
                    .score(score)
                    .feedback(feedback)
                    .build();
            interviewRepository.save(interview);
        } catch (Exception e) {
            System.err.println("Error persisting interview: " + e.getMessage());
        }

        return result;
    }

    public Map<String, Object> getCareerGuidance(String currentRole, String targetRole, List<String> skills) {
        Map<String, Object> body = new HashMap<>();
        body.put("current_role", currentRole);
        body.put("target_role", targetRole);
        body.put("skills", skills);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                aiServiceUrl + "/career-guidance",
                HttpMethod.POST, req, Map.class
        );
        return response.getBody() != null ? response.getBody() : Map.of();
    }
}
