from utils.gemini_client import GeminiClient

class QuestionGenerator:
    def __init__(self):
        self.client = GeminiClient()

    def generate(self, skills, experience):
        """Fetches technical interview questions based on candidate's skills and experience."""
        return self.client.generate_questions(skills, experience)
