import os
import json
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import List, Optional

# --- Pydantic Schemas for Structured Outputs ---

class Job(BaseModel):
    job_id: int
    title: str
    company: str
    description: str
    required_skills: str
    match_score: float

class JobMatchingResponse(BaseModel):
    matched_jobs: List[Job]

class Question(BaseModel):
    id: int
    question: str
    difficulty: str
    expected_topics: str

class GenerateQuestionsResponse(BaseModel):
    questions: List[Question]

class InterviewEvaluation(BaseModel):
    score: int
    feedback: str
    technical_knowledge_score: int
    communication_score: int
    confidence_score: int

class RoadmapStep(BaseModel):
    step: int
    topic: str
    duration: str
    details: str
    resources: List[str]

class CareerGuidanceResponse(BaseModel):
    career_recommendation: str
    learning_roadmap: List[RoadmapStep]
    certifications: List[str]

class ResumeAnalysisResponse(BaseModel):
    resume_score: int
    summary_feedback: str
    end_to_end_summary: str
    garbage_to_remove: List[str]
    critical_mistakes: List[str]
    immediate_job_matches: List[str]
    ai_replacement_risk: str
    strengths: List[str]
    detailed_formatting_analysis: str
    detailed_keyword_analysis: str
    detailed_experience_analysis: str
    detailed_skills_analysis: str
    why_it_would_be_rejected: List[str]
    how_to_get_more_interviews: List[str]

import time

class GeminiClient:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        self.has_key = bool(self.api_key)
        self.client = None
        
        if self.has_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Failed to configure Gemini: {e}")
                self.has_key = False

    # Model fallback chain: uses modern models that the API key supports
    MODEL_FALLBACK_CHAIN = [
        'gemini-2.5-flash-lite',
        'gemini-2.5-flash',
        'gemini-2.0-flash-lite',
        'gemini-2.0-flash',
        'gemini-flash-latest',
        'gemini-flash-lite-latest',
        'gemini-pro-latest'
    ]

    # Class-level circuit breaker to prevent repeated slow API calls if quota/key is broken
    _circuit_broken = False

    def generate_structured_content(self, prompt, schema):
        """Generates structured JSON via Gemini. Automatically falls back through
        multiple models if quota is exhausted or model is unavailable."""
        if GeminiClient._circuit_broken:
            raise Exception("CIRCUIT_BREAKER_ACTIVE: Gemini API is known to be offline or at quota.")

        if not self.has_key or not self.client:
            raise Exception("GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY env var.")

        last_error = None
        for model in self.MODEL_FALLBACK_CHAIN:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.1,
                        response_mime_type="application/json",
                        response_schema=schema,
                    )
                )
                print(f"✅ Success using model: {model}")
                return json.loads(response.text)
            except Exception as e:
                err_str = str(e)
                is_skippable = (
                    '429' in err_str or
                    '503' in err_str or
                    'RESOURCE_EXHAUSTED' in err_str or
                    'UNAVAILABLE' in err_str or
                    'quota' in err_str.lower() or
                    '404' in err_str or
                    'NOT_FOUND' in err_str or
                    'not found for API' in err_str or
                    'not supported' in err_str
                )
                if is_skippable:
                    print(f"⚠️  Model '{model}' unavailable (Error: {err_str}). Trying next fallback...")
                    last_error = err_str
                    time.sleep(0.3)
                    continue
                else:
                    print(f"❌ Fatal error on model '{model}': {err_str}")
                    GeminiClient._circuit_broken = True
                    raise Exception(f"Gemini generation error on {model}: {err_str}")

        # All models exhausted — raise a clear, user-friendly error
        GeminiClient._circuit_broken = True
        raise Exception(
            "QUOTA_EXHAUSTED: All Gemini models have reached their daily free-tier quota. "
            "The quota resets daily. Please try again later, or add a billing account to your "
            "Google AI Studio project at https://aistudio.google.com for higher limits."
        )

    def generate_matched_jobs(self, resume_text):
        """Dynamically synthesizes completely tailored job opportunities based on the resume."""
        prompt = (
            f"You are a top-tier HR Executive and Principal Engineering Recruiter at a FAANG company. "
            f"Provide the most accurate, perfect, and clear analysis to generate 4 highly realistic, top-tier job openings tailored precisely to their skill profile. "
            f"Requirements:\n"
            f"1. Companies must be realistic tech giants or high-growth unicorns.\n"
            f"2. Descriptions must sound exactly like real JDs, mentioning specific tech stacks.\n"
            f"3. Calculate a rigorous 'match_score' (e.g., 0.85) based on semantic overlap between their skills and the job requirements.\n\n"
            f"Resume Text:\n{resume_text}"
        )
        return self.generate_structured_content(prompt, JobMatchingResponse)

    def generate_questions(self, skills, experience):
        """Generates interview questions dynamically using Gemini."""
        skills_str = ", ".join(skills) if skills else "General Software Engineering"
        prompt = (
            f"You are an elite pro-level Interviewer and Technical HR Director conducting a rigorous interview. "
            f"The candidate has {experience} of experience and claims proficiency in: {skills_str}. "
            f"Generate 5 highly challenging, specific technical questions that test deep understanding, edge cases, system design, and practical trade-offs. "
            f"Avoid generic questions. Instead of 'What is React?', ask 'How would you optimize a large-scale React app suffering from unnecessary re-renders?'\n"
        )
        return self.generate_structured_content(prompt, GenerateQuestionsResponse)

    def evaluate_answers(self, transcript_items):
        """Evaluates mock interview transcript dynamically using Gemini."""
        transcript_str = "\n".join([f"Q: {item['question']}\nA: {item['answer']}" for item in transcript_items])
        prompt = (
            f"You are a stringent Bar Raiser and top-level HR Professional. Evaluate the following interview transcript with perfect, clear, and highly accurate analysis. "
            f"Grade the candidate strictly across three vectors (0-100 scale):\n"
            f"1. Technical Knowledge: Did they understand the underlying concepts? Did they mention trade-offs or edge cases?\n"
            f"2. Communication Clarity: Was the answer concise and well-structured (e.g., STAR method)?\n"
            f"3. Confidence & Problem Solving: Did they tackle the problem logically?\n\n"
            f"Provide a comprehensive, constructive feedback paragraph explaining EXACTLY what they got right, what they missed, and how to improve. "
            f"Calculate the final 'score' as a weighted average.\n\n"
            f"Transcript:\n{transcript_str}"
        )
        return self.generate_structured_content(prompt, InterviewEvaluation)

    def generate_career_guidance(self, current_role, target_role, skills):
        """Generates a detailed, personalized career roadmap using Gemini."""
        skills_str = ", ".join(skills) if skills else "general development skills"
        prompt = (
            f"Act as an elite Career Coach and Senior HR Director acting as a career mentor. Provide the most accurate and perfect guidance possible. "
            f"The mentee is currently a '{current_role}' and wants to become a '{target_role}'. "
            f"Their current verified skills: {skills_str}.\n\n"
            f"Generate a highly specific, chronological learning roadmap. "
            f"Each step must include realistic durations (e.g., '3 months'), specific topics to master, and actionable details. "
            f"Identify any industry-recognized certifications that carry weight for this transition.\n"
        )
        return self.generate_structured_content(prompt, CareerGuidanceResponse)

    def analyze_full_resume(self, resume_text, job_description=None, experience_level=None, target_job=None):
        """Generates a comprehensive AI-driven qualitative and structural resume analysis."""
        prompt = (
            f"You are an elite, top-tier HR Professional and Chief Talent Acquisition Officer in the HR domain. "
            f"You provide the most accurate, perfect, clear, and best-in-class analysis possible at a pro level. "
            f"Analyze the following candidate's resume text with absolute precision, providing extremely clear and accurate feedback.\n"
        )
        if experience_level:
            prompt += f"The candidate considers themselves a: {experience_level}.\n"
            if experience_level.lower() == "student" or experience_level.lower() == "fresher":
                prompt += f"-> Since they are a {experience_level}, evaluate their academic projects and internships heavily. Be forgiving on years of experience, but strict on clarity and foundational skills.\n"
            else:
                prompt += f"-> Since they are Experienced, be extremely strict on measurable impact, leadership, and system design complexity. No fluff allowed.\n"
                
        if target_job:
            prompt += (
                f"Their Target Future Job is: '{target_job}'.\n"
                f"-> Apply 30+ years of HR Domain Expertise specifically tailored to '{target_job}':\n"
                f"   1. Industry-Specific Standards: Dynamically evaluate the resume against the exact skill set, tools, and methodologies standard for a professional '{target_job}' (whether in Tech, Finance, Marketing, Sales, Healthcare, Product, etc.).\n"
                f"   2. Role-Appropriate Impact: Look for domain-relevant performance metrics (e.g., revenue growth for sales, campaign ROI for marketing, system scale/latency for engineering, efficiency/clinical outcomes for healthcare). Flag a lack of quantifiable metrics appropriate to this role as a critical mistake.\n"
                f"   3. Career Progression: Assess if the experience matches the seniority and trajectory expected for a '{target_job}'.\n"
                f"   4. Contextual Skills: Verify that the skills claimed are logically applied and demonstrated in the projects or professional experiences related to this career path.\n"
            )
        else:
            prompt += (
                f"-> If no target job is specified, dynamically infer the candidate's target career trajectory based on their experience and skills, and evaluate them with 30+ years of HR domain expertise tailored to that inferred industry.\n"
            )

        prompt += (
            f"Evaluation Criteria (MUST BE EXHAUSTIVE, A to Z, POINT-TO-POINT):\n"
            f"- 'resume_score' (0-100) reflecting overall market impact.\n"
            f"- 'summary_feedback': A high-level overview.\n"
            f"- 'end_to_end_summary': A massive, multi-paragraph deep dive into every single aspect of their profile. Leave no stone unturned.\n"
            f"- 'garbage_to_remove': specific cliches, buzzwords, irrelevant hobbies, bad formatting practices, or weak bullet points.\n"
            f"- 'critical_mistakes': structural errors, missing core skills, or things they MUST fix.\n"
            f"- 'immediate_job_matches': specific job titles they are 100% qualified to apply for right now.\n"
            f"- 'ai_replacement_risk': Write a short, brutally honest paragraph predicting if AI will replace their target job ({target_job or 'their current path'}), and how they can future-proof themselves.\n"
            f"- 'strengths': core strengths identified.\n"
            f"- 'detailed_formatting_analysis': A comprehensive, paragraph-length critique of the resume's format, ATS readability, and visual hierarchy.\n"
            f"- 'detailed_keyword_analysis': A comprehensive, paragraph-length breakdown of missing keywords, overused terms, and exactly what ATS systems will flag.\n"
            f"- 'detailed_experience_analysis': A comprehensive, paragraph-length review of their bullet points, highlighting missing quantifiable metrics and how to rewrite them for maximum impact.\n"
            f"- 'detailed_skills_analysis': A comprehensive, paragraph-length skill gap analysis comparing their current skills against top-tier industry expectations.\n"
            f"- 'why_it_would_be_rejected': A list of the brutal, honest reasons why a recruiter or ATS would immediately reject this resume.\n"
            f"- 'how_to_get_more_interviews': A list of highly specific, actionable, step-by-step instructions on what to change right now to triple their interview rate.\n\n"
            f"You MUST provide the maximum possible detail. Give them MORE DATA, more analysis, and perfect accuracy. Do not be minimal.\n\n"
            f"Resume Text:\n{resume_text}\n\n"
        )
            
        return self.generate_structured_content(prompt, ResumeAnalysisResponse)

