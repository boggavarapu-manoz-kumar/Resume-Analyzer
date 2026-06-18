import re
from resume_parser.skill_extractor import SkillExtractor

class KeywordMatcher:
    def __init__(self):
        self.skill_extractor = SkillExtractor()

    def extract_keywords_from_jd(self, jd_text):
        """Extracts key technical keywords from the job description using skill lists."""
        if not jd_text:
            return []
        # Return skills matched in the Job Description
        return self.skill_extractor.extract_skills(jd_text)

    def match_keywords(self, resume_skills, jd_keywords):
        """Compares resume skills vs JD keywords to find overlaps, missings, and match percentage."""
        if not jd_keywords:
            return {
                "match_percentage": 100,
                "present_skills": resume_skills,
                "missing_skills": []
            }

        resume_skills_lower = {s.lower() for s in resume_skills}
        jd_keywords_lower = {k.lower() for k in jd_keywords}

        present = []
        missing = []

        # Find matching and missing skills
        for keyword in jd_keywords:
            if keyword.lower() in resume_skills_lower:
                present.append(keyword)
            else:
                missing.append(keyword)

        # Match score calculation
        match_count = len(present)
        total_count = len(jd_keywords)
        
        match_percentage = int((match_count / total_count) * 100) if total_count > 0 else 100

        return {
            "match_percentage": match_percentage,
            "present_skills": present,
            "missing_skills": missing
        }
