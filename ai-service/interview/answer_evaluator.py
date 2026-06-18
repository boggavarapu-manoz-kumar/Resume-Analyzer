from utils.gemini_client import GeminiClient

class AnswerEvaluator:
    def __init__(self):
        self.client = GeminiClient()

    def evaluate(self, transcript_items):
        """Evaluates a list of question/answer pairs and returns scores and feedback.
        
        transcript_items: list of dicts with keys 'question' and 'answer'.
        """
        return self.client.evaluate_answers(transcript_items)
