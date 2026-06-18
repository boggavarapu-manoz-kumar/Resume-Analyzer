package com.resumeanalyzer.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ResumeDTO {
    private Long resumeId;
    private Long userId;
    private String resumePath;
    private String category;
    private Integer atsScore;
    private List<String> skills;
    private LocalDateTime createdAt;
}
