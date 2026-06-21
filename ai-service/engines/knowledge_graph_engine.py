from pydantic import BaseModel
from typing import List

class KnowledgeGraphResult(BaseModel):
    current_position: str
    target_position: str
    missing_skills_path: List[str]
    learning_path: List[str]

def generate_knowledge_graph(client, resume_text: str, target_job: str = None) -> KnowledgeGraphResult:
    prompt = (
        f"Analyze the skills in this resume. Identify the candidate's current technical position.\n"
        f"Then, assume their target position is {target_job or 'Senior Developer in their field'}.\n"
        f"Generate a skill knowledge graph path showing exactly which connected skills they are missing to bridge the gap.\n"
        f"Provide a sequential learning path.\n\n"
        f"Resume:\n{resume_text}"
    )
    return client.generate_structured_content(prompt, KnowledgeGraphResult)
