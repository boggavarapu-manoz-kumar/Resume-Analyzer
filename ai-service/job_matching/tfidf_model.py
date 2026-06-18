from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class TfidfJobMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')

    def match_jobs(self, resume_text, jobs_list):
        """Matches resume text against a list of jobs using TF-IDF cosine similarity.
        
        jobs_list should be a list of dicts with keys: 'job_id', 'title', 'company', 'description'
        """
        if not resume_text or not jobs_list:
            return []

        # Prepare corpus
        job_docs = [job['description'] for job in jobs_list]
        corpus = [resume_text] + job_docs

        try:
            # Calculate TF-IDF matrix
            tfidf_matrix = self.vectorizer.fit_transform(corpus)
            
            # Cosine similarity between resume (index 0) and all jobs (indices 1 to N)
            similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
            scores = similarities[0]

            matched_jobs = []
            for idx, job in enumerate(jobs_list):
                score = float(scores[idx])
                # Convert to percentage (capping and scaling slightly to make matches look realistic)
                match_percentage = int(score * 100)
                # Ensure it looks reasonable (e.g. at least some match score, capped at 99%)
                match_percentage = max(10, min(99, match_percentage))
                
                matched_jobs.append({
                    "job_id": job['job_id'],
                    "title": job['title'],
                    "company": job['company'],
                    "description": job['description'],
                    "required_skills": job.get('required_skills', ''),
                    "match_score": match_percentage
                })

            # Sort by match score descending
            matched_jobs.sort(key=lambda x: x['match_score'], reverse=True)
            return matched_jobs
            
        except Exception as e:
            print(f"Error in TF-IDF job matching: {e}")
            # Fallback based on skill overlaps
            return self._fallback_match(resume_text, jobs_list)

    def _fallback_match(self, resume_text, jobs_list):
        """Simple keyword matching fallback."""
        matched_jobs = []
        resume_lower = resume_text.lower()
        for job in jobs_list:
            skills = job.get('required_skills', '').split(',')
            matched_skills = 0
            for skill in skills:
                if skill.strip().lower() in resume_lower:
                    matched_skills += 1
            total_skills = len(skills) if skills else 1
            score = int((matched_skills / total_skills) * 100)
            score = max(15, min(95, score))
            
            matched_jobs.append({
                "job_id": job['job_id'],
                "title": job['title'],
                "company": job['company'],
                "description": job['description'],
                "required_skills": job.get('required_skills', ''),
                "match_score": score
            })
        
        matched_jobs.sort(key=lambda x: x['match_score'], reverse=True)
        return matched_jobs
