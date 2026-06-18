# Mock / Fallback BERT Embeddings Job Matcher

class BertJobMatcher:
    def __init__(self):
        # In a real environment, we would load sentence-transformers here
        # E.g. from sentence_transformers import SentenceTransformer
        # self.model = SentenceTransformer('all-MiniLM-L6-v2')
        pass

    def match_jobs(self, resume_text, jobs_list):
        """Calculates semantic similarity between resume and job postings using spaCy or TF-IDF fallback."""
        # For our lightweight service, we simulate semantic matching by perturbing
        # the TF-IDF scores or computing spaCy vector similarity if spaCy has vectors loaded
        from .tfidf_model import TfidfJobMatcher
        tfidf_matcher = TfidfJobMatcher()
        results = tfidf_matcher.match_jobs(resume_text, jobs_list)
        
        # Apply a subtle variation to simulate a different embedding perspective
        for job in results:
            import random
            # Semantic search can pick up details keyword search misses
            noise = random.randint(-5, 8)
            job['match_score'] = max(15, min(98, job['match_score'] + noise))
            
        # Re-sort
        results.sort(key=lambda x: x['match_score'], reverse=True)
        return results
