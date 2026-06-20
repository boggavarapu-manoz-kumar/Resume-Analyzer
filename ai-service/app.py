import os
from dotenv import load_dotenv
load_dotenv()
import tempfile
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Import service modules
from resume_parser.parser import ResumeParser
from ats_engine.ats_calculator import ATSCalculator
from skill_gap.skill_matcher import SkillMatcher
from skill_gap.recommendations import get_skill_recommendations
from job_matching.matcher import JobMatcher
from interview.question_generator import QuestionGenerator
from interview.answer_evaluator import AnswerEvaluator
from interview.feedback_generator import FeedbackGenerator
from utils.preprocessing import clean_text

app = FastAPI(
    title="AI Resume Analyzer API",
    description="FastAPI service for resume parsing, ATS scoring, skill gap analysis, job matching, and mock interview.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
parser = ResumeParser()
ats_calculator = ATSCalculator()
skill_matcher = SkillMatcher()
job_matcher = JobMatcher()
question_generator = QuestionGenerator()
answer_evaluator = AnswerEvaluator()
feedback_generator = FeedbackGenerator()


# ----------- Pydantic Models -----------

class JobItem(BaseModel):
    job_id: int
    title: str
    company: str
    description: str
    required_skills: str

class JobMatchRequest(BaseModel):
    resume_text: str

class SkillGapRequest(BaseModel):
    resume_skills: List[str]
    job_description: str

class InterviewEvalItem(BaseModel):
    question: str
    answer: str

class InterviewEvalRequest(BaseModel):
    transcript: List[InterviewEvalItem]

class CareerGuidanceRequest(BaseModel):
    current_role: str
    target_role: str
    skills: List[str]

class InterviewQuestionsRequest(BaseModel):
    skills: List[str]
    experience: Optional[str] = "2 years of software development"


# ----------- Health Check -----------

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "Resume AI Service", "version": "1.0.0"}


# ----------- Local Fallback Analysis Engine -----------

def _generate_local_analysis(parsed: dict, skills: list, experience_level: str = None, target_job: str = None) -> dict:
    """Rule-based resume analysis used as fallback when all AI quota is exhausted."""
    score = 50
    strengths = []
    critical_mistakes = []
    garbage_to_remove = []

    if parsed.get('email'): score += 5
    else: critical_mistakes.append("Missing contact email — recruiters cannot reach you.")
    if parsed.get('phone'): score += 3
    else: critical_mistakes.append("Missing phone number.")
    if parsed.get('linkedin'): score += 5; strengths.append("LinkedIn profile is included — great for recruiter outreach.")
    else: garbage_to_remove.append("Add your LinkedIn URL. Resumes without LinkedIn lose credibility instantly.")
    if parsed.get('github'): score += 5; strengths.append("GitHub profile is listed — proves you build real things.")

    skill_count = len(skills)
    if skill_count >= 10: score += 10; strengths.append(f"Strong skill breadth with {skill_count} listed technologies.")
    elif skill_count >= 5: score += 5; strengths.append(f"{skill_count} skills detected — solid foundation.")
    else: critical_mistakes.append("Too few skills listed. Add all relevant languages, frameworks, and tools you know.")

    exp = parsed.get('experience', [])
    if len(exp) >= 3: score += 10; strengths.append("Multiple experience entries show career progression.")
    elif len(exp) >= 1: score += 5
    else: critical_mistakes.append("No work experience detected. Add internships, freelance work, or projects.")

    if parsed.get('education'): score += 5; strengths.append("Education section is present.")
    else: critical_mistakes.append("Education section is missing or not detected.")

    garbage_to_remove.append("Remove vague phrases like 'team player', 'hard worker', 'passionate' — they add no value.")
    garbage_to_remove.append("Remove 'References available upon request' — always assumed, wastes space.")

    immediate_jobs = []
    skill_lower = [s.lower() for s in skills]
    if any(s in skill_lower for s in ['react', 'vue', 'angular', 'javascript', 'typescript']): immediate_jobs += ["Frontend Developer", "UI Engineer"]
    if any(s in skill_lower for s in ['python', 'django', 'flask', 'fastapi']): immediate_jobs.append("Python Backend Developer")
    if any(s in skill_lower for s in ['java', 'spring']): immediate_jobs.append("Java Backend Developer")
    if any(s in skill_lower for s in ['aws', 'gcp', 'azure', 'docker', 'kubernetes']): immediate_jobs.append("DevOps / Cloud Engineer")
    if not immediate_jobs: immediate_jobs = ["Software Developer", "Junior Developer", "Technical Associate"]

    return {
        "resume_score": min(score, 90),
        "summary_feedback": (
            f"Rule-based analysis (AI engine is temporarily at quota). "
            f"Your resume has {skill_count} detected skills and {len(exp)} experience entries. "
            "For full AI-powered analysis with deep insights, please try again in a few hours."
        ),
        "strengths": strengths if strengths else ["Resume was successfully parsed."],
        "critical_mistakes": critical_mistakes,
        "garbage_to_remove": garbage_to_remove,
        "immediate_job_matches": immediate_jobs[:6],
        "ai_replacement_risk": (
            f"Based on your target role ({target_job or 'Software Development'}), AI will automate repetitive tasks "
            "but won't replace engineers who master system design and business context. "
            "Future-proof yourself by learning AI-adjacent skills like prompt engineering and MLOps."
        ),
    }


# ----------- Resume Parsing & Analysis -----------

@app.post("/parse-resume")
async def parse_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    experience_level: Optional[str] = Form(None),
    target_job: Optional[str] = Form(None)
):
    """Parses an uploaded PDF or DOCX file and returns extracted information, ATS score, and suggestions."""
    # Validate file type
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ['.pdf', '.docx', '.doc']:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    # Save to temp file
    suffix = ext
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Parse the resume
        parsed = parser.parse(tmp_path)
        
        # Import extractor to also get raw text for ATS
        from resume_parser.extractor import extract_text
        raw_text = extract_text(tmp_path)
        clean = clean_text(raw_text)

        # AI Full Resume Analysis
        from utils.gemini_client import GeminiClient
        client = GeminiClient()
        
        try:
            analysis = client.analyze_full_resume(clean, job_description, experience_level, target_job)
        except Exception as ai_err:
            err_str = str(ai_err)
            # If all AI models are quota-exhausted, generate a local rule-based analysis
            if 'QUOTA_EXHAUSTED' in err_str or 'quota' in err_str.lower():
                print("⚠️ AI quota exhausted — falling back to local analysis engine.")
                skills = parsed.get('skills', [])
                analysis = _generate_local_analysis(parsed, skills, experience_level, target_job)
                analysis['_quota_warning'] = (
                    "⚠️ The AI analysis engine has hit its daily free-tier limit. "
                    "This is a rule-based analysis. Full AI analysis resumes tomorrow, "
                    "or you can add billing to https://aistudio.google.com for instant access."
                )
            else:
                raise  # Re-raise non-quota errors
        
        return {
            "filename": filename,
            "parsed_data": parsed,
            "analysis": analysis,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing resume: {str(e)}")
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


# ----------- ATS Score Endpoint (text input) -----------

@app.post("/analyze-ats")
async def analyze_ats(
    resume_text: str = Form(...),
    job_description: Optional[str] = Form(None)
):
    """Calculates ATS score from raw resume text and optional job description."""
    if not resume_text:
        raise HTTPException(status_code=400, detail="resume_text is required.")
    
    clean = clean_text(resume_text)
    # Create minimal parsed dict from text
    from resume_parser.skill_extractor import SkillExtractor
    import re
    from resume_parser.regex_patterns import EMAIL_PATTERN, PHONE_PATTERN
    
    skill_ext = SkillExtractor()
    skills = skill_ext.extract_skills(clean)
    email_match = EMAIL_PATTERN.search(clean)
    phone_match = PHONE_PATTERN.search(clean)
    
    parsed = {
        "email": email_match.group(0) if email_match else "N/A",
        "phone": phone_match.group(0) if phone_match else "N/A",
        "linkedin": "N/A",
        "github": "N/A",
        "skills": skills,
        "experience": ["Parsed from text"],
        "education": ["Parsed from text"]
    }
    
    ats_result = ats_calculator.calculate_score(parsed, clean, job_description)
    skill_recs = get_skill_recommendations(ats_result.get("missing_skills", []))

    return {
        "ats_score": ats_result["ats_score"],
        "ats_breakdown": ats_result["breakdown"],
        "suggestions": ats_result["suggestions"],
        "missing_skills": ats_result["missing_skills"],
        "skill_recommendations": skill_recs
    }


# ----------- Skill Gap Analysis -----------

@app.post("/skill-gap")
async def skill_gap_analysis(request: SkillGapRequest):
    """Compares resume skills against job description and returns missing skills."""
    result = skill_matcher.compare_skills(request.resume_skills, request.job_description)
    recs = get_skill_recommendations(result.get("missing_skills", []))
    result["skill_recommendations"] = recs
    return result


# ----------- Job Matching -----------

@app.post("/match-jobs")
async def match_jobs(request: JobMatchRequest):
    """Generates dynamic tailored job opportunities based on resume using Gemini."""
    from utils.gemini_client import GeminiClient
    client = GeminiClient()
    result = client.generate_matched_jobs(request.resume_text)
    return result


# ----------- Interview Questions -----------

@app.post("/generate-questions")
async def generate_questions(request: InterviewQuestionsRequest):
    """Generates technical interview questions based on candidate skills."""
    result = question_generator.generate(request.skills, request.experience)
    return result


# ----------- Interview Answer Evaluation -----------

@app.post("/evaluate-interview")
async def evaluate_interview(request: InterviewEvalRequest):
    """Evaluates a mock interview transcript and returns score and feedback."""
    transcript = [item.dict() for item in request.transcript]
    result = answer_evaluator.evaluate(transcript)
    return result


# ----------- Career Guidance -----------

@app.post("/career-guidance")
async def career_guidance(request: CareerGuidanceRequest):
    """Generates career path recommendations, learning roadmap, and certification suggestions."""
    result = feedback_generator.generate_career_guidance(
        request.current_role,
        request.target_role,
        request.skills
    )
    return result


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
