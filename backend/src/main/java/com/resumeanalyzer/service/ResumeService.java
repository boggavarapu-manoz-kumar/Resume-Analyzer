package com.resumeanalyzer.service;

import com.resumeanalyzer.entity.Resume;
import com.resumeanalyzer.entity.Skill;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.repository.ResumeRepository;
import com.resumeanalyzer.repository.UserRepository;
import com.resumeanalyzer.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final FileUtil fileUtil;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public Map<String, Object> uploadAndAnalyze(MultipartFile file, String userEmail, String jobDescription, String experienceLevel, String targetJob) throws Exception {
        // Get user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save file locally
        String filePath = fileUtil.saveFile(file);

        // Call AI service
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });
        if (jobDescription != null && !jobDescription.isBlank()) {
            body.add("job_description", jobDescription);
        }
        if (experienceLevel != null && !experienceLevel.isBlank()) {
            body.add("experience_level", experienceLevel);
        }
        if (targetJob != null && !targetJob.isBlank()) {
            body.add("target_job", targetJob);
        }

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> aiResponse = restTemplate.exchange(
                aiServiceUrl + "/parse-resume",
                HttpMethod.POST,
                request,
                Map.class
        );

        Map<String, Object> aiData = aiResponse.getBody() != null ? aiResponse.getBody() : new HashMap<>();

        // Extract overall score from analysis block
        Integer overallScore = 0;
        if (aiData.containsKey("analysis")) {
            Map<?, ?> analysis = (Map<?, ?>) aiData.get("analysis");
            if (analysis.containsKey("resume_score")) {
                overallScore = (Integer) analysis.get("resume_score");
            } else if (analysis.containsKey("base_analysis")) {
                Map<?, ?> baseAnalysis = (Map<?, ?>) analysis.get("base_analysis");
                if (baseAnalysis.containsKey("resume_score")) {
                    overallScore = (Integer) baseAnalysis.get("resume_score");
                }
            }
        }
        
        String category = (targetJob != null && !targetJob.isBlank()) ? targetJob : "Software Engineer";

        // Persist resume record
        Resume resume = Resume.builder()
                .user(user)
                .resumePath(filePath)
                .category(category)
                .atsScore(overallScore)
                .build();
        resumeRepository.save(resume);

        // Return full AI response with added DB resume ID
        aiData.put("resume_id", resume.getResumeId());
        aiData.put("target_job", targetJob);
        return aiData;
    }

    public List<Resume> getUserResumes(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return resumeRepository.findByUserUserId(user.getUserId());
    }

    public Map<String, Object> analyzeExistingResume(Long resumeId, String userEmail, String jobDescription, String experienceLevel, String targetJob) throws Exception {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        if (!resume.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized to access this resume");
        }

        // Call AI service
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new org.springframework.core.io.FileSystemResource(resume.getResumePath()));
        
        if (jobDescription != null && !jobDescription.isBlank()) {
            body.add("job_description", jobDescription);
        }
        if (experienceLevel != null && !experienceLevel.isBlank()) {
            body.add("experience_level", experienceLevel);
        }
        if (targetJob != null && !targetJob.isBlank()) {
            body.add("target_job", targetJob);
        }

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> aiResponse = restTemplate.exchange(
                aiServiceUrl + "/parse-resume",
                HttpMethod.POST,
                request,
                Map.class
        );

        Map<String, Object> aiData = aiResponse.getBody() != null ? aiResponse.getBody() : new HashMap<>();

        // Extract overall score from analysis block
        Integer overallScore = 0;
        if (aiData.containsKey("analysis")) {
            Map<?, ?> analysis = (Map<?, ?>) aiData.get("analysis");
            if (analysis.containsKey("resume_score")) {
                overallScore = (Integer) analysis.get("resume_score");
            }
        }

        // Update existing resume score
        resume.setAtsScore(overallScore);
        resumeRepository.save(resume);

        // Return full AI response with added DB resume ID
        aiData.put("resume_id", resume.getResumeId());
        aiData.put("target_job", targetJob);
        return aiData;
    }

    public Map<String, Object> analyzeDeep(Long resumeId, String targetJob) throws Exception {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new org.springframework.core.io.FileSystemResource(resume.getResumePath()));
        
        if (targetJob != null && !targetJob.isBlank()) {
            body.add("target_job", targetJob);
        }

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> aiResponse = restTemplate.exchange(
                aiServiceUrl + "/analyze-deep",
                HttpMethod.POST,
                request,
                Map.class
        );

        return aiResponse.getBody() != null ? aiResponse.getBody() : new HashMap<>();
    }
}
