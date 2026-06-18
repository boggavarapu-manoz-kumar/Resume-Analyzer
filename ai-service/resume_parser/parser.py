import os
import spacy
from .extractor import extract_text
from .regex_patterns import EMAIL_PATTERN, PHONE_PATTERN, LINKEDIN_PATTERN, GITHUB_PATTERN
from .skill_extractor import SkillExtractor

class ResumeParser:
    def __init__(self):
        # Initialize SpaCy
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except Exception as e:
            print(f"Failed to load SpaCy model: {e}. Downloading model or falling back.")
            try:
                os.system("python -m spacy download en_core_web_sm")
                self.nlp = spacy.load("en_core_web_sm")
            except:
                self.nlp = None
                
        # Initialize Skill Extractor
        self.skill_extractor = SkillExtractor()

    def parse(self, file_path):
        """Main parsing execution."""
        text = extract_text(file_path)
        if not text:
            return {
                "name": "Unknown",
                "email": "N/A",
                "phone": "N/A",
                "skills": [],
                "linkedin": "N/A",
                "github": "N/A",
                "experience": [],
                "education": []
            }

        # Extracted info
        email = self._extract_email(text)
        phone = self._extract_phone(text)
        linkedin = self._extract_linkedin(text)
        github = self._extract_github(text)
        skills = self.skill_extractor.extract_skills(text)
        name = self._extract_name(text)
        
        # Simple section extraction
        experience = self._extract_section(text, ["experience", "work history", "employment"])
        education = self._extract_section(text, ["education", "academic", "qualification", "degree"])

        return {
            "name": name,
            "email": email,
            "phone": phone,
            "skills": skills,
            "linkedin": linkedin,
            "github": github,
            "experience": experience,
            "education": education
        }

    def _extract_email(self, text):
        match = EMAIL_PATTERN.search(text)
        return match.group(0) if match else "N/A"

    def _extract_phone(self, text):
        match = PHONE_PATTERN.search(text)
        return match.group(0) if match else "N/A"

    def _extract_linkedin(self, text):
        match = LINKEDIN_PATTERN.search(text)
        return match.group(0) if match else "N/A"

    def _extract_github(self, text):
        match = GITHUB_PATTERN.search(text)
        return match.group(0) if match else "N/A"

    def _extract_name(self, text):
        """Extracts candidate's name. Uses SpaCy NER as primary, first non-empty line as fallback."""
        if self.nlp:
            # Check first 500 characters of text for name to avoid body entities
            doc = self.nlp(text[:500])
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    # Simple heuristic: name should not have numbers, emails, or be too long
                    name_candidate = ent.text.strip()
                    if len(name_candidate.split()) >= 2 and len(name_candidate.split()) <= 4:
                        if not any(char.isdigit() for char in name_candidate):
                            if "@" not in name_candidate:
                                return name_candidate
        
        # Fallback to the first non-empty line of text
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        if lines:
            # Return first line if it looks reasonable
            first_line = lines[0]
            if len(first_line) < 50 and not "@" in first_line:
                return first_line
        
        return "Unknown Candidate"

    def _extract_section(self, text, keywords):
        """Heuristic to extract text block following headers like 'Experience' or 'Education'."""
        lines = text.split('\n')
        section_lines = []
        in_section = False
        
        # We also define headers of other sections to know when to stop
        stop_keywords = [
            "experience", "work", "education", "skills", "projects", "certifications",
            "summary", "objective", "interests", "languages", "publications", "activities"
        ]
        
        for line in lines:
            line_clean = line.strip().lower()
            if not line_clean:
                continue
                
            # Check if this line is our target section header
            if any(kw in line_clean for kw in keywords) and len(line_clean) < 30:
                in_section = True
                continue
            
            # Check if we hit another header, signaling the end of the section
            if in_section:
                # If we encounter another header block, stop
                if any(line_clean.startswith(skw) or line_clean == skw for skw in stop_keywords if not any(kw in skw for kw in keywords)) and len(line_clean) < 30:
                    in_section = False
                    break
                section_lines.append(line.strip())
                
        # Return cleaned block
        return section_lines if section_lines else ["Details not explicitly structured or section header not found."]
