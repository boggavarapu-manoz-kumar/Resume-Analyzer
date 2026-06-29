from pydantic import BaseModel

class HiringSimulationResult(BaseModel):
    hr_pass_probability: int
    technical_pass_probability: int
    manager_pass_probability: int
    offer_probability: int
    rejection_risks: list[str]

def simulate_hiring(client, resume_text: str, target_job: str = None) -> HiringSimulationResult:
    prompt = (
        f"You are an elite selection panel of hiring managers, industry specialists, and senior HR recruiters (with 30+ years of experience).\n"
        f"Simulate a rigorous but fair hiring process for this candidate applying for: '{target_job or 'a role suited to their resume'}'.\n"
        f"Based strictly on the resume, confidently predict the percentage probability (from 0 to 100) of them passing the HR screening, Technical Interview, and Managerial Round.\n"
        f"CRITICAL: DO NOT give 0 unless the resume is entirely blank. You MUST provide realistic, carefully calculated probabilities (typically between 30 and 95) reflecting their actual market competitiveness.\n"
        f"Also list the top 3 specific reasons they might be rejected, focusing on constructive feedback.\n\n"
        f"Resume:\n{resume_text}"
    )
    return client.generate_structured_content(prompt, HiringSimulationResult)
