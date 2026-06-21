from pydantic import BaseModel
from typing import List

class PersonaResult(BaseModel):
    persona: str
    primary_goal: str
    priority_analysis: List[str]

def detect_persona(client, resume_text: str) -> PersonaResult:
    prompt = (
        f"Analyze the following resume and detect the candidate's Persona (e.g., Fresher, Experienced, Student, Career Switcher).\n"
        f"Identify their primary career goal based on their skills and experience.\n"
        f"List the priority areas they need analysis on (e.g., ATS, Projects, Salary Growth, etc.).\n\n"
        f"Resume:\n{resume_text}"
    )
    return client.generate_structured_content(prompt, PersonaResult)
