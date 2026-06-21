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
        f"Act as a Career Trajectory Engine. Based on the candidate's resume, predict their realistic future job titles.\n"
        f"1. State their 'current_stage' (e.g. 'Java Beginner', 'Mid-level Backend', 'Senior Dev').\n"
        f"2. Predict their exact job title in 'six_months'.\n"
        f"3. Predict their exact job title in 'one_year'.\n"
        f"4. Predict their exact job title in 'three_years'.\n"
        f"5. Provide an array of 'milestones' (step, focus) needed to achieve the 3-year goal.\n"
        f"Target Job (if any): {target_job or 'Not specified'}\n\n"
        f"Resume:\n{resume_text}"
    )
    return client.generate_structured_content(prompt, CareerTrajectoryResult)
