import re

def clean_text(text):
    """Cleans raw text of extra spaces, special characters, and converts to lowercase."""
    if not text:
        return ""
    
    # Remove HTML tags if any
    text = re.sub(r'<[^>]*>', ' ', text)
    
    # Replace newlines and carriage returns with spaces
    text = re.sub(r'[\r\n]+', ' ', text)
    
    # Remove multiple spaces
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()
