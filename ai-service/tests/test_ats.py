import pytest
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from ats_engine.ats_calculator import ATSCalculator

@pytest.fixture
def ats_calc():
    return ATSCalculator()

def test_calculate_score_perfect_resume(ats_calc):
    parsed_resume = {
        "email": "test@example.com",
        "phone": "1234567890",
        "linkedin": "linkedin.com/in/test",
        "github": "github.com/test",
        "experience": ["Worked as a software engineer for 5 years building scalable applications using Python and React."],
        "education": ["B.S. in Computer Science"],
        "skills": ["Python", "React", "Docker", "SQL", "AWS"]
    }
    
    # 200 words raw text to pass the min word count (150)
    raw_text = "word " * 200 
    
    jd = "We need a software engineer with Python, React, Docker, and SQL experience."
    
    result = ats_calc.calculate_score(parsed_resume, raw_text, jd)
    
    assert result["ats_score"] > 80 # Should be very high
    assert "Python" not in result["missing_skills"]
    assert len(result["missing_skills"]) == 0 or all(skill not in parsed_resume["skills"] for skill in result["missing_skills"])
    assert result["breakdown"]["structure_score"] == 100
    assert result["breakdown"]["sections_score"] == 100

def test_calculate_score_poor_resume(ats_calc):
    parsed_resume = {
        "email": "N/A",
        "phone": "N/A",
        "linkedin": "N/A",
        "github": "N/A",
        "experience": [],
        "education": [],
        "skills": ["HTML"]
    }
    
    # 50 words raw text to fail min word count
    raw_text = "word " * 50 
    
    jd = "We need a software engineer with Python, React, Docker, and SQL experience."
    
    result = ats_calc.calculate_score(parsed_resume, raw_text, jd)
    
    assert result["ats_score"] < 50 # Should be very low
    assert result["breakdown"]["structure_score"] < 100
    assert result["breakdown"]["sections_score"] < 100
    assert len(result["missing_skills"]) > 0

def test_calculate_score_no_jd(ats_calc):
    parsed_resume = {
        "email": "test@example.com",
        "phone": "1234567890",
        "linkedin": "linkedin.com/in/test",
        "github": "github.com/test",
        "experience": ["Worked as a software engineer."],
        "education": ["B.S. in Computer Science"],
        "skills": ["Python", "React", "Docker", "SQL", "AWS", "Java", "C++", "Kubernetes", "Linux", "Git"]
    }
    raw_text = "word " * 200 
    
    result = ats_calc.calculate_score(parsed_resume, raw_text, None)
    
    assert result["ats_score"] > 80
    assert result["breakdown"]["keyword_score"] == 100
    assert len(result["missing_skills"]) == 0
