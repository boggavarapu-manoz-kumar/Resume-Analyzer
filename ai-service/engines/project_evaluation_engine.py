from pydantic import BaseModel
from typing import List

class ProjectAnalysis(BaseModel):
    project_name: str
    technical_complexity_score: int
    deployment_score: int
    industry_relevance_score: int
    problem_solving_score: int
    resume_impact_score: int
    improvement_suggestion: str

class ProjectEvaluationResult(BaseModel):
    projects: List[ProjectAnalysis]
    overall_project_strength: int

def evaluate_projects(client, resume_text: str) -> ProjectEvaluationResult:
    prompt = (
        f"You are a Senior Engineering Manager evaluating candidate projects.\n"
        f"Extract the top projects from this resume.\n"
        f"For each project, score its technical complexity, deployment status, industry relevance, and problem-solving level (0-10).\n"
        f"Calculate the overall resume impact of the project.\n"
        f"Provide a 1-sentence actionable suggestion to improve how the project is presented or built.\n"
        f"Finally, give an overall project strength score (0-100) for the candidate.\n\n"
        f"Resume:\n{resume_text}"
    )
    return client.generate_structured_content(prompt, ProjectEvaluationResult)
