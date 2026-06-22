from pydantic import BaseModel
from typing import List

class Milestone(BaseModel):
    step: str
    focus: str

class CareerTrajectoryResult(BaseModel):
    current_stage: str
    six_months: str
    one_year: str
    three_years: str
    milestones: List[Milestone]

def generate_career_trajectory(client, resume_text: str, target_job: str = None) -> CareerTrajectoryResult:
    prompt = (
        f"Act as a professional Career Trajectory Coach. Based on the candidate's resume and target job, predict their realistic future job titles tailored to their domain.\n"
        f"1. State their 'current_stage' (e.g. 'Junior level', 'Mid-level Professional', 'Senior Executive' dynamically based on their field).\n"
        f"2. Predict their exact job title in 'six_months'.\n"
        f"3. Predict their exact job title in 'one_year'.\n"
        f"4. Predict their exact job title in 'three_years'.\n"
        f"5. Provide an array of 'milestones' (step, focus) needed to achieve the 3-year goal.\n"
        f"Target Job (if any): {target_job or 'Dynamically derived from resume'}\n\n"
        f"Resume:\n{resume_text}"
    )
    return client.generate_structured_content(prompt, CareerTrajectoryResult)
