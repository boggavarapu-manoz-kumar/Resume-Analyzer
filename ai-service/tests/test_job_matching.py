import pytest
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from job_matching.tfidf_model import TfidfJobMatcher

@pytest.fixture
def matcher():
    return TfidfJobMatcher()

def test_match_jobs(matcher):
    resume_text = "I am a software engineer with 5 years of experience in Python, React, and SQL."
    jobs_list = [
        {
            "job_id": 1,
            "title": "Backend Engineer",
            "company": "Tech Corp",
            "description": "Looking for a backend engineer proficient in Python and SQL databases.",
            "required_skills": "Python, SQL"
        },
        {
            "job_id": 2,
            "title": "Frontend Developer",
            "company": "Web Inc",
            "description": "Looking for a frontend developer with experience in React, HTML, and CSS.",
            "required_skills": "React, HTML, CSS"
        },
        {
            "job_id": 3,
            "title": "Data Scientist",
            "company": "Data LLC",
            "description": "Looking for a data scientist with experience in machine learning and R.",
            "required_skills": "Machine Learning, R"
        }
    ]
    
    matches = matcher.match_jobs(resume_text, jobs_list)
    
    assert len(matches) == 3
    # Both job 1 and 2 should have higher scores than job 3
    job1 = next(j for j in matches if j["job_id"] == 1)
    job3 = next(j for j in matches if j["job_id"] == 3)
    
    assert job1["match_score"] > job3["match_score"]

def test_match_jobs_empty(matcher):
    matches = matcher.match_jobs("", [])
    assert matches == []

    matches2 = matcher.match_jobs("Resume text", [])
    assert matches2 == []
