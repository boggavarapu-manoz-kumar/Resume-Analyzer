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

class CareerGuidanceResponse(BaseModel):
    career_recommendation: str
    learning_roadmap: List[RoadmapStep]
    certifications: List[str]

class ResumeAnalysisResponse(BaseModel):
    overall_score: int
    summary_feedback: str
    strengths: List[str]
    areas_for_improvement: List[str]
    structural_feedback: str
    missing_keywords: List[str]

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

    def generate_structured_content(self, prompt, schema, max_retries=3):
        """Generates structured JSON response via Gemini using Pydantic schema with retry logic."""
        if not self.has_key or not self.client:
            raise Exception("GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY env var.")
        
        model = 'gemini-2.5-flash-lite'
        
        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.0,
                        response_mime_type="application/json",
                        response_schema=schema,
                    )
                )
                print(f"✅ Used model: {model} with structured output on attempt {attempt + 1}")
                return json.loads(response.text)
            except Exception as e:
                err_str = str(e)
                print(f"⚠️ Gemini structured generation failed (attempt {attempt + 1}/{max_retries}): {err_str}")
                if attempt < max_retries - 1:
                    sleep_time = (2 ** attempt) * 2 # 2, 4, 8 seconds
                    print(f"Retrying in {sleep_time} seconds...")
                    time.sleep(sleep_time)
                else:
                    raise Exception(f"Gemini generation failed on {model} after {max_retries} attempts: {err_str}")

    def generate_matched_jobs(self, resume_text):
        """Dynamically synthesizes completely tailored job opportunities based on the resume."""
        prompt = (
            f"You are a high-level MNC tech recruiter AI. Analyze the following candidate resume text "
            f"and dynamically generate 4 highly realistic, ideal job openings tailored specifically to their skills. "
            f"The jobs must look like real postings from top companies (Google, Microsoft, Amazon, Meta, or similar top-tier companies). "
            f"Assign a realistic 'match_score' (between 0.70 and 0.99) indicating how well they fit the role.\n"
            f"CRITICAL: PROVIDE THE MOST ACCURATE, PERFECT, 10000000% CORRECT ANSWERS AND MAIN POINTS.\n\n"
            f"Resume Text:\n{resume_text}"
        )
        return self.generate_structured_content(prompt, JobMatchingResponse)

    def generate_questions(self, skills, experience):
        """Generates interview questions dynamically using Gemini."""
        skills_str = ", ".join(skills) if skills else "General Software Development"
        prompt = (
            f"Generate 5 highly relevant, challenging technical interview questions for a candidate with "
            f"skills in {skills_str} and experience level: {experience}. "
            f"Make the questions specific, detailed, and at an MNC-interview level (Google, Amazon, Microsoft). "
            f"CRITICAL: PROVIDE THE MOST ACCURATE, PERFECT, 10000000% CORRECT ANSWERS AND MAIN POINTS."
        )
        return self.generate_structured_content(prompt, GenerateQuestionsResponse)

    def evaluate_answers(self, transcript_items):
        """Evaluates mock interview transcript dynamically using Gemini."""
        transcript_str = "\n".join([f"Q: {item['question']}\nA: {item['answer']}" for item in transcript_items])
        prompt = (
            f"You are a senior technical interviewer at a top MNC company. "
            f"Evaluate the following interview transcript where a candidate answers technical questions. "
            f"Give an honest, detailed assessment. Rate their performance on Technical Knowledge, Communication Clarity, and Problem-Solving Approach.\n"
            f"Calculate an overall Interview Readiness Score (0-100).\n"
            f"CRITICAL: PROVIDE THE MOST ACCURATE, PERFECT, 10000000% CORRECT ANSWERS AND MAIN POINTS.\n\n"
            f"Transcript:\n{transcript_str}"
        )
        return self.generate_structured_content(prompt, InterviewEvaluation)

    def generate_career_guidance(self, current_role, target_role, skills):
        """Generates a detailed, personalized career roadmap using Gemini."""
        skills_str = ", ".join(skills) if skills else "general development skills"
        prompt = (
            f"Act as a senior career counselor at a top-tier tech company. "
            f"A candidate is currently a '{current_role}' wishing to transition to '{target_role}'. "
            f"Their current skills include: {skills_str}.\n\n"
            f"Generate a highly specific, actionable, and realistic career roadmap with timeline estimates.\n"
            f"CRITICAL: PROVIDE THE MOST ACCURATE, PERFECT, 10000000% CORRECT ANSWERS AND MAIN POINTS."
        )
        return self.generate_structured_content(prompt, CareerGuidanceResponse)

    def analyze_full_resume(self, resume_text, job_description=None):
        """Generates a comprehensive AI-driven qualitative and structural resume analysis."""
        prompt = (
            f"You are an expert tech recruiter and resume evaluator at a top-tier MNC. "
            f"Analyze the following candidate resume text in deep detail. "
            f"Provide an overall score out of 100 based on impact, clarity, and keyword density. "
            f"List their core strengths, key areas for improvement, and a paragraph on structural feedback. "
            f"If a job description is provided, also highlight missing skills.\n"
            f"CRITICAL: PROVIDE THE MOST ACCURATE, PERFECT, 10000000% CORRECT ANSWERS AND MAIN POINTS.\n\n"
            f"Resume Text:\n{resume_text}\n\n"
        )
        if job_description:
            prompt += f"Target Job Description:\n{job_description}\n"
            
        return self.generate_structured_content(prompt, ResumeAnalysisResponse)
