from ats_engine.keyword_matcher import KeywordMatcher
from resume_parser.skill_extractor import SkillExtractor

class SkillMatcher:
    def __init__(self):
        self.matcher = KeywordMatcher()

    def compare_skills(self, resume_skills, job_description):
        """Compares skills and returns present, missing, and match metrics."""
        jd_keywords = self.matcher.extract_keywords_from_jd(job_description)
        results = self.matcher.match_keywords(resume_skills, jd_keywords)
        
        return {
            "present_skills": results["present_skills"],
            "missing_skills": results["missing_skills"],
            "match_ratio": results["match_percentage"]
        }
