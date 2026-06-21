from pydantic import BaseModel
from typing import Dict

class SkillDemand(BaseModel):
    skill: str
    demand: str

class MarketDemandResult(BaseModel):
    overall_demand: str
    skill_demand_list: list[SkillDemand]
    best_target_companies: list[str]
    salary_confidence_score: int

def analyze_market_demand(client, resume_text: str) -> MarketDemandResult:
    prompt = (
        f"Act as a Tech Market Analyst. Review this candidate's skills.\n"
        f"1. Rate the overall market demand for their profile (High/Medium/Low).\n"
        f"2. Map each of their top 5 skills to current market demand by returning a list of skills and their demand (High/Medium/Low).\n"
        f"3. Suggest the top 5 specific companies or types of companies (Service, Product, Startup) they should target.\n"
        f"4. Provide a salary confidence score (0-100) based on how well their skills pay in the current market.\n\n"
        f"Resume:\n{resume_text}"
    )
    return client.generate_structured_content(prompt, MarketDemandResult)
