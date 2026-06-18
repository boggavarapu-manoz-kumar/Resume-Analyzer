import os
import csv

class SkillExtractor:
    def __init__(self, skills_csv_path=None):
        self.skills = set()
        
        # If path not provided, assume default location relative to file
        if not skills_csv_path:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            skills_csv_path = os.path.join(current_dir, '..', 'datasets', 'skills.csv')
        
        self._load_skills(skills_csv_path)

    def _load_skills(self, file_path):
        """Loads skills from CSV file, falling back to a pre-defined set if file is missing."""
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    next(reader, None)  # Skip header
                    for row in reader:
                        if row:
                            self.skills.add(row[0].strip().lower())
            else:
                self._load_fallbacks()
        except Exception as e:
            print(f"Error loading skills CSV: {e}. Loading fallbacks.")
            self._load_fallbacks()

    def _load_fallbacks(self):
        """In case CSV is missing, initialize a core set of skills."""
        fallbacks = [
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust',
            'html', 'css', 'react', 'angular', 'vue', 'tailwind css', 'spring boot',
            'fastapi', 'django', 'flask', 'sql', 'postgresql', 'mysql', 'mongodb',
            'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'git', 'github',
            'machine learning', 'deep learning', 'nlp', 'spacy', 'nltk', 'scikit-learn',
            'pytorch', 'tensorflow', 'pandas', 'numpy', 'rest apis', 'microservices'
        ]
        for skill in fallbacks:
            self.skills.add(skill)

    def extract_skills(self, text):
        """Extracts matched skills from the given text using token/phrase matching."""
        if not text:
            return []
        
        text_lower = text.lower()
        matched = []
        
        # We check both exact word/phrase matching
        for skill in self.skills:
            # Match skill with word boundaries to avoid matching sub-words (like "Go" in "Good")
            # For complex skill names with punctuation (C++, C#), we do direct substring search
            if '+' in skill or '#' in skill or '.' in skill or ' ' in skill:
                if skill in text_lower:
                    matched.append(skill)
            else:
                # Simple word boundary check
                pattern = r'\b' + re_escape_skill(skill) + r'\b'
                import re
                if re.search(pattern, text_lower):
                    matched.append(skill)
                    
        # Return properly capitalized version if we want, or just title case them
        # Let's clean up and capitalize known words
        result = []
        for m in sorted(list(set(matched))):
            # Try to restore casing if possible (e.g. JavaScript, Python)
            restored = self._restore_casing(m)
            result.append(restored)
        return result

    def _restore_casing(self, skill_lower):
        """Simple helper to capitalize standard skills nicely."""
        capitalizations = {
            'python': 'Python', 'java': 'Java', 'javascript': 'JavaScript', 'typescript': 'TypeScript',
            'c++': 'C++', 'c#': 'C#', 'go': 'Go', 'rust': 'Rust', 'html': 'HTML', 'css': 'CSS',
            'react': 'React', 'angular': 'Angular', 'vue': 'Vue', 'tailwind css': 'Tailwind CSS',
            'spring boot': 'Spring Boot', 'fastapi': 'FastAPI', 'django': 'Django', 'flask': 'Flask',
            'sql': 'SQL', 'postgresql': 'PostgreSQL', 'mysql': 'MySQL', 'mongodb': 'MongoDB',
            'docker': 'Docker', 'kubernetes': 'Kubernetes', 'aws': 'AWS', 'gcp': 'GCP', 'azure': 'Azure',
            'git': 'Git', 'github': 'GitHub', 'machine learning': 'Machine Learning',
            'deep learning': 'Deep Learning', 'nlp': 'NLP', 'spacy': 'SpaCy', 'nltk': 'NLTK',
            'scikit-learn': 'Scikit-Learn', 'pytorch': 'PyTorch', 'tensorflow': 'TensorFlow',
            'pandas': 'Pandas', 'numpy': 'NumPy', 'rest apis': 'REST APIs', 'microservices': 'Microservices'
        }
        return capitalizations.get(skill_lower, skill_lower.title())

def re_escape_skill(skill):
    """Escapes regex special characters in a skill name."""
    import re
    return re.escape(skill)
