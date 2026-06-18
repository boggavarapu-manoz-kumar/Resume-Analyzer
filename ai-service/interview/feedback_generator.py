from utils.gemini_client import GeminiClient

class FeedbackGenerator:
    def __init__(self):
        self.client = GeminiClient()

    def generate_career_guidance(self, current_role, target_role, skills):
        """Generates career path, learning roadmap, and certification suggestions."""
        return self.client.generate_career_guidance(current_role, target_role, skills)
