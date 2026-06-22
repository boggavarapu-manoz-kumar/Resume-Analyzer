from pydantic import BaseModel
from typing import List

class InterviewQuestion(BaseModel):
    category: str
    question: str
    difficulty: str
    expected_answer_focus: str

class InterviewPredictionResult(BaseModel):
    technical_readiness_score: int
    communication_readiness_score: int
    project_explanation_score: int
    predicted_questions: List[InterviewQuestion]

def predict_interview_questions(client, resume_text: str, target_job: str = None) -> InterviewPredictionResult:
    prompt = (
        f"Act as a Lead Interviewer and Senior Director in the target field with 30+ years of HR and interviewing experience.\n"
        f"Review this candidate's resume and predict exactly what questions they will be asked in a real interview for: '{target_job or 'their matching role derived from their resume'}'.\n"
        f"1. Give them a technical/domain readiness_score, communication_readiness_score, and project_explanation_score (0-100).\n"
        f"2. Generate an array of 5 predicted_questions. For each, specify the category (e.g. 'Domain Technical', 'Behavioral', 'Case Study/Problem Solving' dynamically selected for the target job), the exact question, difficulty (Easy/Medium/Hard), and the expected_answer_focus.\n\n"
        f"Resume:\n{resume_text}"
    )
    return client.generate_structured_content(prompt, InterviewPredictionResult)
