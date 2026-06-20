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
    garbage_to_remove: List[str]
    critical_mistakes: List[str]
    immediate_job_matches: List[str]
    ai_replacement_risk: str
    strengths: List[str]

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

    # Model fallback chain: fastest/cheapest first, fallback to older models if quota exceeded
    MODEL_FALLBACK_CHAIN = [
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash-lite',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
    ]

    def generate_structured_content(self, prompt, schema):
        """Generates structured JSON via Gemini. Automatically falls back through
        multiple models if quota is exhausted or model is unavailable."""
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
                    print(f"⚠️  Model '{model}' unavailable. Trying next fallback...")
                    last_error = err_str
                    time.sleep(0.3)
                    continue
                else:
                    print(f"❌ Fatal error on model '{model}': {err_str}")
                    raise Exception(f"Gemini generation error on {model}: {err_str}")

        # All models exhausted — raise a clear, user-friendly error
        raise Exception(
            "QUOTA_EXHAUSTED: All Gemini models have reached their daily free-tier quota. "
            "The quota resets daily. Please try again later, or add a billing account to your "
            "Google AI Studio project at https://aistudio.google.com for higher limits."
        )

    def generate_matched_jobs(self, resume_text):
        """Dynamically synthesizes completely tailored job opportunities based on the resume."""
        prompt = (
            f"You are a Principal Engineering Recruiter at a FAANG company (Meta, Google, Amazon). "
            f"Critically analyze the candidate's resume text below and generate 4 highly realistic, top-tier job openings tailored precisely to their skill profile. "
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
            f"You are a Staff Software Engineer at Meta conducting a technical interview. "
            f"The candidate has {experience} of experience and claims proficiency in: {skills_str}. "
            f"Generate 5 highly challenging, specific technical questions that test deep understanding, edge cases, system design, and practical trade-offs. "
            f"Avoid generic questions. Instead of 'What is React?', ask 'How would you optimize a large-scale React app suffering from unnecessary re-renders?'\n"
        )
        return self.generate_structured_content(prompt, GenerateQuestionsResponse)

    def evaluate_answers(self, transcript_items):
        """Evaluates mock interview transcript dynamically using Gemini."""
        transcript_str = "\n".join([f"Q: {item['question']}\nA: {item['answer']}" for item in transcript_items])
        prompt = (
            f"You are a stringent Bar Raiser interviewer at Amazon. Evaluate the following interview transcript. "
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
            f"Act as a Principal Staff Engineer acting as a career mentor. "
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
            f"You are a 100-year-experience Elite Tech Recruiter. You are brutally honest. "
            f"Analyze the following candidate's resume text.\n"
        )
        if experience_level:
            prompt += f"The candidate considers themselves a: {experience_level}.\n"
            if experience_level.lower() == "student" or experience_level.lower() == "fresher":
                prompt += f"-> Since they are a {experience_level}, evaluate their academic projects and internships heavily. Be forgiving on years of experience, but strict on clarity and foundational skills.\n"
            else:
                prompt += f"-> Since they are Experienced, be extremely strict on measurable impact, leadership, and system design complexity. No fluff allowed.\n"
                
        if target_job:
            prompt += f"Their Target Future Job is: {target_job}.\n"

        prompt += (
            f"Evaluation Criteria:\n"
            f"- Provide a 'resume_score' (0-100) reflecting overall market impact.\n"
            f"- Identify 'garbage_to_remove': cliches, buzzwords, irrelevant hobbies, bad formatting practices, or weak bullet points.\n"
            f"- Identify 'critical_mistakes': structural errors, missing core skills, or things they MUST fix.\n"
            f"- Suggest 'immediate_job_matches': specific job titles they are 100% qualified to apply for right now.\n"
            f"- Assess 'ai_replacement_risk': Write a short, brutally honest paragraph predicting if AI will replace their target job ({target_job or 'their current path'}), and how they can future-proof themselves.\n\n"
            f"Resume Text:\n{resume_text}\n\n"
        )
            
        return self.generate_structured_content(prompt, ResumeAnalysisResponse)

