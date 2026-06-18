package com.resumeanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ATSResponse {
    private Integer atsScore;
    private List<String> suggestions;
    private List<String> missingSkills;
    private List<String> presentSkills;
}
