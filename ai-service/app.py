import os
from dotenv import load_dotenv
load_dotenv()
import asyncio # Reload trigger 2
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

# Import new modular engines
from engines.persona_engine import detect_persona
from engines.hiring_simulation_engine import simulate_hiring
from engines.knowledge_graph_engine import generate_knowledge_graph
from engines.market_demand_engine import analyze_market_demand
from engines.project_evaluation_engine import evaluate_projects
from engines.career_trajectory_engine import generate_career_trajectory
from engines.personal_brand_engine import analyze_personal_brand
from engines.interview_prediction_engine import predict_interview_questions
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
    import re
    score = 50
    strengths = []
    critical_mistakes = []
    garbage_to_remove = []

    # Basic checklist scoring
    if parsed.get('email') and parsed.get('email') != 'N/A': 
        score += 5
    else: 
        critical_mistakes.append("Missing contact email — recruiters cannot reach you.")
        
    if parsed.get('phone') and parsed.get('phone') != 'N/A': 
        score += 3
    else: 
        critical_mistakes.append("Missing phone number.")
        
    if parsed.get('linkedin') and parsed.get('linkedin') != 'N/A': 
        score += 5
        strengths.append("LinkedIn profile is included — great for recruiter outreach.")
    else: 
        garbage_to_remove.append("Add your LinkedIn URL. Resumes without LinkedIn lose credibility instantly.")
        
    if parsed.get('github') and parsed.get('github') != 'N/A': 
        score += 5
        strengths.append("GitHub profile is listed — proves you build real things.")
    else:
        garbage_to_remove.append("Add your GitHub URL or portfolio link to demonstrate hands-on projects.")

    skill_count = len(skills)
    if skill_count >= 10: 
        score += 15
        strengths.append(f"Strong skill breadth with {skill_count} listed technologies.")
    elif skill_count >= 5: 
        score += 10
        strengths.append(f"{skill_count} skills detected — solid foundation.")
    else: 
        score += 5
        critical_mistakes.append("Too few skills listed. Add all relevant languages, frameworks, databases, and tools you have worked with.")

    exp = parsed.get('experience', [])
    clean_exp = [line for line in exp if line.strip() and "Details not explicitly structured" not in line]
    if len(clean_exp) >= 15: 
        score += 15
        strengths.append("Substantial and detailed work history showing strong career duration.")
    elif len(clean_exp) >= 5: 
        score += 10
        strengths.append("Solid experience entries showing professional background.")
    elif len(clean_exp) >= 1: 
        score += 5
    else: 
        critical_mistakes.append("No clear work experience detected. Add internships, freelance work, open-source contributions, or project roles.")

    edu = parsed.get('education', [])
    clean_edu = [line for line in edu if line.strip() and "Details not explicitly structured" not in line]
    if clean_edu: 
        score += 5
        strengths.append("Education section is present.")
    else: 
        critical_mistakes.append("Education section is missing or not clearly detected.")

    # Deduce role
    skill_lower = [s.lower() for s in skills]
    primary_skills = skills[:4] if skills else ["Software Development"]
    
    immediate_jobs = []
    if any(s in skill_lower for s in ['react', 'vue', 'angular', 'svelte', 'javascript', 'typescript', 'frontend', 'html', 'css']): 
        immediate_jobs += ["Frontend Developer", "Software Engineer (Frontend)", "UI Engineer"]
    if any(s in skill_lower for s in ['python', 'django', 'flask', 'fastapi', 'node', 'express', 'go', 'golang', 'rust']): 
        immediate_jobs += ["Backend Developer", "Python Engineer", "Software Engineer (Backend)"]
    if any(s in skill_lower for s in ['java', 'spring', 'springboot', 'hibernate']): 
        immediate_jobs += ["Java Developer", "Backend Engineer (Java)"]
    if any(s in skill_lower for s in ['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'devops', 'cicd', 'jenkins']): 
        immediate_jobs += ["DevOps Engineer", "Cloud Infrastructure Engineer", "SRE"]
    if any(s in skill_lower for s in ['data', 'pandas', 'numpy', 'spark', 'sql', 'analytics', 'tensorflow', 'pytorch', 'ml', 'ai']): 
        immediate_jobs += ["Data Engineer", "Data Scientist", "Machine Learning Engineer"]
        
    if not immediate_jobs: 
        immediate_jobs = ["Software Engineer", "Full Stack Developer", "Developer"]

    primary_job = target_job or immediate_jobs[0]

    # Dynamically extract projects
    proj_section = parsed.get('projects', [])
    clean_proj = [line for line in proj_section if line.strip() and "Details not explicitly structured" not in line]
    
    extracted_projects = []
    for line in clean_proj:
        line_s = line.strip()
        if 3 < len(line_s) < 45 and not line_s.startswith(('-', '*', '•', '1.', '2.', '3.')):
            if any(word[0].isupper() for word in line_s.split() if word.isalpha()):
                extracted_projects.append(line_s)
    
    extracted_projects = list(dict.fromkeys(extracted_projects))[:3]
    
    if not extracted_projects:
        if len(skills) >= 2:
            extracted_projects = [
                f"Full-Stack {skills[0]} & {skills[1]} Application",
                f"Distributed {skills[0]} API Service",
                f"Cloud-Native {skills[1]} Platform"
            ]
        elif skills:
            extracted_projects = [
                f"Dynamic {skills[0]} Web Application",
                f"Interactive {skills[0]} Portal",
                f"High-Performance {skills[0]} Utility"
            ]
        else:
            extracted_projects = [
                "Collaborative Software Platform",
                "Automated Data Analytics Pipeline",
                "Modern Single Page Application"
            ]

    # Build project evaluations dynamically
    proj_evals = []
    for p in extracted_projects:
        comp = hash(p) % 4 + 6 
        dep = hash(p + "dep") % 5 + 5 
        rel = hash(p + "rel") % 4 + 7 
        prob = hash(p + "prob") % 3 + 7 
        impact = hash(p + "imp") % 4 + 7 
        
        proj_evals.append({
            "project_name": p,
            "technical_complexity_score": comp,
            "deployment_score": dep,
            "industry_relevance_score": rel,
            "problem_solving_score": prob,
            "resume_impact_score": impact,
            "improvement_suggestion": f"Quantify the metrics for {p} by specifying scale (e.g., 'reduced latency by 20%' or 'increased throughput to 5k req/sec')."
        })

    overall_proj_strength = int(sum(pe["resume_impact_score"] for pe in proj_evals) / len(proj_evals) * 10) if proj_evals else 70

    # Dynamic Persona
    exp_years = 0
    text_full = " ".join(clean_exp).lower()
    year_matches = re.findall(r'(\d+)\+?\s*years?', text_full)
    if year_matches:
        try:
            exp_years = max(int(y) for y in year_matches)
        except ValueError:
            pass
    if exp_years == 0:
        exp_years = len(clean_exp) // 3
        
    if exp_years >= 6 or experience_level == "Senior":
        detected_persona = "Senior Industry Professional"
    elif exp_years >= 2 or experience_level == "Experienced":
        detected_persona = "Experienced Industry Specialist"
    elif experience_level == "Student":
        detected_persona = "Academic Student Candidate"
    else:
        detected_persona = "Entry-Level Associate / Fresher"

    # Missing skills pathway
    learning_path = []
    missing_skills = []
    if "DevOps" in primary_job or "Infrastructure" in primary_job:
        missing_skills = ["Kubernetes orchestration", "Infrastructure as Code (Terraform)", "CI/CD Pipeline Security", "Prometheus & Grafana Monitoring"]
        learning_path = [
            "Phase 1: Build robust GitOps delivery pipelines using GitHub Actions and ArgoCD.",
            "Phase 2: Master Terraform multi-environment provisioning and state management.",
            "Phase 3: Deep dive into Kubernetes production networking, Ingress controllers, and Helm packaging."
        ]
    elif "Data" in primary_job or "Machine" in primary_job:
        missing_skills = ["Apache Spark / PySpark", "Airflow DAG Orchestration", "Data Lakehouse architectures (Delta Lake)", "MLflow model tracking"]
        learning_path = [
            "Phase 1: Master PySpark cluster computing and distributed dataset partitioning.",
            "Phase 2: Implement Apache Airflow for robust schedule-driven ETL DAG execution.",
            "Phase 3: Deploy real-time streaming pipelines with Kafka and feature stores."
        ]
    elif "Frontend" in primary_job or "UI" in primary_job:
        missing_skills = ["Next.js App Router & SSR", "Tailwind CSS responsive structures", "Micro-frontends & Module Federation", "E2E testing (Playwright)"]
        learning_path = [
            "Phase 1: Deep dive into Next.js React Server Components, streaming, and Server Actions.",
            "Phase 2: Optimize Core Web Vitals (LCP, INP, CLS) using layout refactoring.",
            "Phase 3: Implement comprehensive visual regression and E2E coverage with Playwright."
        ]
    else:
        missing_skills = ["Microservice Design Patterns", "Redis caching strategy", "System scalability & Rate limiting", "Kafka event-driven systems"]
        learning_path = [
            "Phase 1: Study distributed system patterns (CQRS, Event Sourcing, Circuit Breakers).",
            "Phase 2: Add Redis caching layers to database queries and verify execution performance.",
            "Phase 3: Implement Kafka topics for asynchronous message passing and parallel event handling."
        ]

    # Generate custom predicted interview questions based on actual skills
    questions = []
    category_list = ["Technical Core", "System Design", "Problem Solving", "Scenario-based", "Behavioral"]
    for i, category in enumerate(category_list):
        skill_ref = skills[i % len(skills)] if skills else "software engineering"
        if category == "Technical Core":
            q_text = f"How does memory management or optimization work when handling massive structures in {skill_ref}?"
            focus = f"In-depth explanation of {skill_ref} compiler/runtime details, heap vs stack usage, or garbage collection mechanics."
            diff = "Hard"
        elif category == "System Design":
            q_text = f"How would you design a highly scalable, fault-tolerant service using {skill_ref} to handle 100k peak requests per minute?"
            focus = "Database scaling, caching layers, stateless nodes, load balancing, and rate limiting strategy."
            diff = "Hard"
        elif category == "Problem Solving":
            q_text = f"Explain a challenging bug or performance bottleneck you resolved in {skill_ref}."
            focus = "Debugging methodologies, profiling tools used, identifying root cause, and long-term resolution design."
            diff = "Medium"
        elif category == "Scenario-based":
            q_text = f"How do you handle breaking changes or backward compatibility when refactoring a legacy codebase using {skill_ref}?"
            focus = "Blue-green deployment, database migration versioning, API version management, and automated fallback tests."
            diff = "Medium"
        else: 
            q_text = f"Tell me about a time you had to adapt quickly to a new technology stack related to {skill_ref} under tight deadlines."
            focus = "Self-learning methods, structured knowledge acquisition, collaboration with peers, and final successful execution."
            diff = "Easy"
            
        questions.append({
            "category": category,
            "question": q_text,
            "difficulty": diff,
            "expected_answer_focus": focus
        })

    # Strengths, mistakes, and garbage to remove
    if not strengths:
        strengths = [
            f"Strong alignment with modern {primary_job} requirements.",
            f"Hands-on demonstration of {', '.join(primary_skills)} in listed sections."
        ]
    if len(garbage_to_remove) < 2:
        garbage_to_remove += [
            "Remove generic declarations, objectives, or summaries that don't add concrete value.",
            "Remove generic descriptions of day-to-day responsibilities; replace with specific, high-impact achievements."
        ]
    if not critical_mistakes:
        critical_mistakes = [
            "Ensure every single project or role includes quantifiable metrics (e.g., scale, throughput, speed increases).",
            "Optimize resume for ATS readability by avoiding multi-column tables or complex nested layouts."
        ]

    # Rejection risks & Action plans
    why_rejected = [
        f"The candidate claims {skill_count} skills, but their experience bullets lack quantifiable proof of business impact.",
        f"Missing or generic keyword metrics for key industry standards expected in a {primary_job} role.",
        "ATS score could be optimized further by simplifying structural elements."
    ]
    
    how_to_get_more_interviews = [
        f"Explicitly rewrite bullet points using the Google X-Y-Z formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
        f"Tailor the resume profile to explicitly include keywords matching the {primary_job} description.",
        f"Add GitHub, LinkedIn, and direct links to live deployments for {extracted_projects[0]} to verify engineering competency."
    ]

    return {
        "persona": {
            "persona": detected_persona,
            "primary_goal": primary_job,
            "priority_analysis": ["ATS Metrics", "Core Skills", "Quantifiable Accomplishments"]
        },
        "hiring_simulation": {
            "hr_pass_probability": min(score + 10, 95),
            "technical_pass_probability": min(score - 5, 90),
            "manager_pass_probability": min(score, 90),
            "offer_probability": min(score - 10, 85),
            "rejection_risks": why_rejected
        },
        "knowledge_graph": {
            "current_position": detected_persona,
            "target_position": primary_job,
            "missing_skills_path": missing_skills,
            "learning_path": learning_path
        },
        "market_demand": {
            "overall_demand": "High" if len(skills) >= 8 else "Medium",
            "skill_demand_list": [{"skill": s, "demand": "High" if i % 2 == 0 else "Medium"} for i, s in enumerate(skills[:6])],
            "best_target_companies": [f"High-Growth Startups employing {primary_skills[0] if primary_skills else 'modern tech'}", f"Top-Tier Tech Corporations", "Innovative Fintech Platforms"],
            "salary_confidence_score": min(score + 10, 95)
        },
        "project_evaluation": {
            "projects": proj_evals,
            "overall_project_strength": overall_proj_strength
        },
        "career_trajectory": {
            "current_stage": detected_persona,
            "six_months": f"Associate {primary_job}" if exp_years < 2 else f"Professional {primary_job}",
            "one_year": f"Senior {primary_job}",
            "three_years": f"Lead {primary_job} / Principal Architect",
            "milestones": [
                {"step": "Month 1-3", "focus": f"Master production grade {', '.join(primary_skills[:2])} implementation details."},
                {"step": "Month 4-12", "focus": "Lead architectural changes and system design decisions for high-load flows."},
                {"step": "Month 13-36", "focus": "Design multi-region service deployments, orchestrate tech migration plans, and mentor junior developers."}
            ]
        },
        "personal_brand": {
            "technical_brand_score": min(score, 92),
            "online_presence_score": min(score + 5, 95) if parsed.get('github') != 'N/A' or parsed.get('linkedin') != 'N/A' else 50,
            "professional_visibility_score": min(score - 5, 88),
            "overall_brand_score": min(score, 90),
            "brand_suggestions": [
                f"Contribute to open-source libraries written in {primary_skills[0] if primary_skills else 'your key stacks'}.",
                "Write technical blog posts explaining the architecture of your personal projects to build public authority."
            ]
        },
        "interview_prediction": {
            "technical_readiness_score": min(score, 92),
            "communication_readiness_score": min(score + 5, 95),
            "project_explanation_score": min(score - 5, 88),
            "predicted_questions": questions
        },
        "base_analysis": {
            "resume_score": min(score, 95),
            "summary_feedback": (
                f"Rule-based analysis (AI engine is temporarily at quota). "
                f"Your resume shows strong proficiency in {', '.join(primary_skills)}. "
                f"For full AI-powered analysis with deep insights, please try again in a few hours."
            ),
            "end_to_end_summary": (
                f"Based on the parsed resume of {parsed.get('name', 'Candidate')}, this profile exhibits "
                f"foundational to advanced competencies in {', '.join(skills)}. "
                f"The education background is structured around {', '.join(clean_edu[:2]) if clean_edu else 'their academic history'}. "
                f"With {exp_years} years of estimated industry duration, the candidate is a strong fit for a professional "
                f"'{primary_job}' position. To achieve maximum response rate, they should optimize for "
                f"quantifying their achievements and ensuring standard layout styling."
            ),
            "strengths": strengths,
            "critical_mistakes": critical_mistakes,
            "garbage_to_remove": garbage_to_remove,
            "immediate_job_matches": immediate_jobs[:6],
            "ai_replacement_risk": f"The '{primary_job}' position has a low to moderate risk of automation. Future-proof your career by mastering complex architectures, developer productivity engineering, and large scale distributed system design.",
            "detailed_formatting_analysis": f"The structural layout of your resume is clean and contains core contact points. However, ensure that there are no multi-column grids or complex graphic dividers that could disrupt ATS parsing pipelines.",
            "detailed_keyword_analysis": f"Your resume successfully highlights key skills like {', '.join(primary_skills)}. You should optimize for keywords targeting {primary_job} by aligning terms with specific JDs.",
            "detailed_experience_analysis": f"Your experience details are structured, but can be significantly enhanced. Ensure each bullet point utilizes strong action verbs and starts with a clear impact statement.",
            "detailed_skills_analysis": f"Comparing your skills against industry standards for {primary_job}, you possess solid foundational knowledge but need to bridge gaps in advanced cloud systems and architecture.",
            "why_it_would_be_rejected": why_rejected,
            "how_to_get_more_interviews": how_to_get_more_interviews
        }
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

        # AI Full Resume Analysis (Analysis Orchestrator)
        from utils.gemini_client import GeminiClient
        import asyncio
        
        # Reset the circuit breaker for every new upload to try the AI key once
        GeminiClient._circuit_broken = False
        client = GeminiClient()
        
        try:
            # Run only base_analysis for optimal first load
            analysis = {}
            
            try:
                base_result = await asyncio.to_thread(client.analyze_full_resume, clean, job_description, experience_level, target_job)
                analysis['base_analysis'] = base_result if isinstance(base_result, dict) else base_result.model_dump()
            except Exception as ai_err:
                print(f"Base analysis failed: {ai_err}")
                analysis['base_analysis'] = {"error": str(ai_err)}
                if "QUOTA_EXHAUSTED" in str(ai_err) or '429' in str(ai_err):
                    quota_exhausted = True
            
            # Fallback on any error to ensure resilience
            logger.warning("AI Base analysis failed or API key was invalid. Falling back to dynamic local engine.")
            skills = parsed.get('skills', [])
            analysis = _generate_local_analysis(parsed, skills, experience_level, target_job)
            analysis['_quota_warning'] = (
                "⚠️ The AI analysis engine fell back to local generation. "
                "Please verify your API key is a valid Gemini API key starting with 'AIzaSy' in ai-service/.env."
            )
        
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


# ----------- Deep Analysis Endpoint -----------

@app.post("/analyze-deep")
async def analyze_deep(
    file: UploadFile = File(...),
    target_job: Optional[str] = Form(None)
):
    """Runs the remaining heavy AI engines for deep analysis."""
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
        from resume_parser.extractor import extract_text
        raw_text = extract_text(tmp_path)
        clean = clean_text(raw_text)

        from utils.gemini_client import GeminiClient
        import asyncio
        
        # Reset the circuit breaker for every new analysis to try the AI key once
        GeminiClient._circuit_broken = False
        client = GeminiClient()
        
        tasks = [
            ("persona", detect_persona, (client, clean)),
            ("hiring_simulation", simulate_hiring, (client, clean, target_job)),
            ("knowledge_graph", generate_knowledge_graph, (client, clean, target_job)),
            ("market_demand", analyze_market_demand, (client, clean)),
            ("project_evaluation", evaluate_projects, (client, clean)),
            ("career_trajectory", generate_career_trajectory, (client, clean, target_job)),
            ("personal_brand", analyze_personal_brand, (client, clean)),
            ("interview_prediction", predict_interview_questions, (client, clean, target_job))
        ]
        
        analysis = {}
        any_failed = False
        for key, func, args in tasks:
            try:
                result = await asyncio.to_thread(func, *args)
                analysis[key] = result if isinstance(result, dict) else result.model_dump()
                await asyncio.sleep(1) # Add a small 1-second delay
            except Exception as ai_err:
                print(f"Engine {key} failed: {ai_err}")
                analysis[key] = {"error": str(ai_err)}
                any_failed = True
                    
        if any_failed:
            print("⚠️ Some AI engines failed in deep analysis — blending dynamic local analysis for those engines.")
            from resume_parser.skill_extractor import SkillExtractor
            skill_ext = SkillExtractor()
            skills = skill_ext.extract_skills(clean)
            
            # Simple parse to feed to local analysis
            import re
            from resume_parser.regex_patterns import EMAIL_PATTERN, PHONE_PATTERN
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
            local_data = _generate_local_analysis(parsed, skills, "Experienced", target_job)
            
            # Merge local data into analysis for any keys that failed
            for key in [k for k, _ in tasks]:
                if key not in analysis or "error" in analysis[key] or not analysis[key]:
                    analysis[key] = local_data.get(key, {})

        return {
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running deep analysis: {str(e)}")
    finally:
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
