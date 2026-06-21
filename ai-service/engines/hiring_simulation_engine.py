from pydantic import BaseModel

class HiringSimulationResult(BaseModel):
    hr_pass_probability: int
    technical_pass_probability: int
    manager_pass_probability: int
    offer_probability: int
    rejection_risks: list[str]

def simulate_hiring(client, resume_text: str, target_job: str = None) -> HiringSimulationResult:
    prompt = (
        f"You are a panel of hiring managers, tech leads, and HR recruiters at a top tech company.\n"
        f"Simulate a hiring process for this candidate applying for {target_job or 'a software engineering role'}.\n"
        f"Based on the resume, predict the percentage probability of them passing the HR screening, Technical Interview, and Managerial Round.\n"
        f"Also list the top 3 reasons they might be rejected.\n\n"
        f"Resume:\n{resume_text}"
    )
    return client.generate_structured_content(prompt, HiringSimulationResult)
