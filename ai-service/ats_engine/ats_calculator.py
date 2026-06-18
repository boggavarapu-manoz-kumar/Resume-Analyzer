from .scoring_rules import (
    WEIGHT_KEYWORDS, WEIGHT_STRUCTURE, WEIGHT_SECTIONS,
    MIN_WORD_COUNT, MAX_WORD_COUNT,
    PENALTY_MISSING_EMAIL, PENALTY_MISSING_PHONE,
    PENALTY_MISSING_LINKEDIN, PENALTY_MISSING_GITHUB
)
from .keyword_matcher import KeywordMatcher

class ATSCalculator:
    def __init__(self):
        self.keyword_matcher = KeywordMatcher()

    def calculate_score(self, parsed_resume, raw_text, job_description=None):
        """Calculates the overall ATS score and builds improvement tips."""
        suggestions = []
        
        # 1. Structure and Formatting Score (Max 100 points)
        structure_score = 100
        
        # Penalties for missing contact details
        if parsed_resume.get("email") == "N/A":
            structure_score += PENALTY_MISSING_EMAIL
            suggestions.append("Add a professional email address to the header.")
        if parsed_resume.get("phone") == "N/A":
            structure_score += PENALTY_MISSING_PHONE
            suggestions.append("Include a contact phone number.")
        if parsed_resume.get("linkedin") == "N/A":
            structure_score += PENALTY_MISSING_LINKEDIN
            suggestions.append("Link your LinkedIn profile for recruiters to view details.")
        if parsed_resume.get("github") == "N/A":
            structure_score += PENALTY_MISSING_GITHUB
            suggestions.append("Provide a GitHub link to showcase project source codes.")

        # Word count check
        word_count = len(raw_text.split()) if raw_text else 0
        if word_count < MIN_WORD_COUNT:
            structure_score -= 20
            suggestions.append(f"Resume text is too brief ({word_count} words). Expand on your project details and experience to hit at least {MIN_WORD_COUNT} words.")
        elif word_count > MAX_WORD_COUNT:
            structure_score -= 10
            suggestions.append(f"Resume is slightly verbose ({word_count} words). Condense your explanations to stay under {MAX_WORD_COUNT} words.")
            
        structure_score = max(0, structure_score)

        # 2. Key Sections Presence Score (Max 100 points)
        sections_score = 100
        experience_block = parsed_resume.get("experience", [])
        education_block = parsed_resume.get("education", [])
        skills_block = parsed_resume.get("skills", [])

        if not experience_block or "not found" in experience_block[0].lower():
            sections_score -= 40
            suggestions.append("Add a dedicated 'Experience' or 'Work History' section.")
        if not education_block or "not found" in education_block[0].lower():
            sections_score -= 30
            suggestions.append("Add an 'Education' or 'Academic background' section.")
        if not skills_block:
            sections_score -= 30
            suggestions.append("List technical skills in a separate section to help parser indexing.")
            
        sections_score = max(0, sections_score)

        # 3. Keyword Match Score (Max 100 points)
        keyword_score = 100
        present_skills = parsed_resume.get("skills", [])
        missing_skills = []
        
        if job_description:
            jd_keywords = self.keyword_matcher.extract_keywords_from_jd(job_description)
            if jd_keywords:
                match_results = self.keyword_matcher.match_keywords(present_skills, jd_keywords)
                keyword_score = match_results["match_percentage"]
                missing_skills = match_results["missing_skills"]
                
                if missing_skills:
                    suggestions.append(f"Incorporate missing keywords required by the job: {', '.join(missing_skills[:5])}.")
            else:
                # If JD has no keywords, default to 100
                keyword_score = 100
        else:
            # If no JD is provided, base keyword score on count of skills present
            num_skills = len(present_skills)
            if num_skills < 5:
                keyword_score = 50
                suggestions.append("Add more technical keywords to match common developer profiles.")
            elif num_skills < 10:
                keyword_score = 80
            else:
                keyword_score = 100

        # Calculate weighted sum
        final_score = int(
            (structure_score * WEIGHT_STRUCTURE) +
            (sections_score * WEIGHT_SECTIONS) +
            (keyword_score * WEIGHT_KEYWORDS)
        )
        
        # Cap score between 0 and 100
        final_score = max(0, min(100, final_score))
        
        return {
            "ats_score": final_score,
            "breakdown": {
                "structure_score": structure_score,
                "sections_score": sections_score,
                "keyword_score": keyword_score
            },
            "suggestions": suggestions,
            "missing_skills": missing_skills
        }
