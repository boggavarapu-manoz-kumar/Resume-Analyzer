from .tfidf_model import TfidfJobMatcher
from .bert_model import BertJobMatcher

class JobMatcher:
    def __init__(self):
        self.tfidf_matcher = TfidfJobMatcher()
        self.bert_matcher = BertJobMatcher()

    def match(self, resume_text, jobs_list, algorithm='TF-IDF'):
        """Triggers matching with the chosen algorithm."""
        if algorithm == 'BERT':
            return self.bert_matcher.match_jobs(resume_text, jobs_list)
        else:
            return self.tfidf_matcher.match_jobs(resume_text, jobs_list)
