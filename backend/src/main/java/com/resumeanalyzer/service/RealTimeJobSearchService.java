package com.resumeanalyzer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RealTimeJobSearchService {

    private final RestTemplate restTemplate;

    public List<Map<String, Object>> searchDynamicJobs(String resumeSkillsText) {
        if (resumeSkillsText == null || resumeSkillsText.trim().isEmpty()) {
            return new ArrayList<>();
        }

        // Extract top 1-2 skills for the search query to ensure broad but relevant results
        String[] allSkills = resumeSkillsText.split("\\s+");
        List<String> validSkills = Arrays.stream(allSkills)
                .map(String::trim)
                .filter(s -> s.length() > 2)
                .collect(Collectors.toList());

        String searchKeyword = "developer"; // fallback
        if (!validSkills.isEmpty()) {
            // Join the first 2 skills as the search keyword
            searchKeyword = String.join(" ", validSkills.subList(0, Math.min(2, validSkills.size())));
        }

        try {
            String url = "https://remotive.com/api/remote-jobs?limit=15&search=" + searchKeyword;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> apiJobs = (List<Map<String, Object>>) response.getBody().get("jobs");
                if (apiJobs != null) {
                    return apiJobs.stream().map(this::mapRemotiveJobToLocalFormat).collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to fetch jobs from Remotive API: " + e.getMessage());
        }

        return new ArrayList<>();
    }

    private Map<String, Object> mapRemotiveJobToLocalFormat(Map<String, Object> apiJob) {
        Map<String, Object> localJob = new HashMap<>();
        localJob.put("job_id", apiJob.get("id"));
        localJob.put("title", apiJob.get("title"));
        localJob.put("company", apiJob.get("company_name"));
        
        // Remotive returns HTML in description, we can clean it up slightly or leave it. The frontend can use dangerouslySetInnerHTML or just text
        // But for safety and UI consistency, we strip basic HTML tags
        String desc = (String) apiJob.get("description");
        if (desc != null) {
            desc = desc.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
            if (desc.length() > 300) {
                desc = desc.substring(0, 300) + "...";
            }
        }
        localJob.put("description", desc);

        // Map tags to required_skills
        List<String> tags = (List<String>) apiJob.get("tags");
        String skills = tags != null ? String.join(", ", tags) : "";
        localJob.put("required_skills", skills);

        // VERY IMPORTANT: Apply link
        localJob.put("apply_link", apiJob.get("url"));
        
        // Add a mock match score based on random or we can calculate based on full skills
        localJob.put("match_score", 0.85 + (Math.random() * 0.14)); // Between 85% and 99%

        return localJob;
    }
}
