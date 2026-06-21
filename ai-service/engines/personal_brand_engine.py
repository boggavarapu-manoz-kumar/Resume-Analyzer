from pydantic import BaseModel
from typing import List

class PersonalBrandResult(BaseModel):
    technical_brand_score: int
    online_presence_score: int
    professional_visibility_score: int
    overall_brand_score: int
    brand_suggestions: List[str]

def analyze_personal_brand(client, resume_text: str) -> PersonalBrandResult:
    prompt = (
        f"Act as a Personal Brand Engine. Analyze this resume for professional visibility and impact.\n"
        f"1. Provide a 'technical_brand_score' (0-100) based on their tech stack, projects, and complexity.\n"
        f"2. Provide an 'online_presence_score' (0-100) based on mentions of GitHub, LinkedIn, Portfolios, or Open Source.\n"
        f"3. Provide a 'professional_visibility_score' (0-100) based on hackathons, publications, leadership, or certifications.\n"
        f"4. Calculate the 'overall_brand_score' (0-100).\n"
        f"5. Provide an array of actionable 'brand_suggestions' to improve their market visibility.\n\n"
        f"Resume:\n{resume_text}"
    )
    return client.generate_structured_content(prompt, PersonalBrandResult)
