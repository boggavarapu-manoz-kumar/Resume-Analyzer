import re

# Regex for email extraction
EMAIL_PATTERN = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')

# Regex for phone number extraction (various global formats)
PHONE_PATTERN = re.compile(
    r'(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,12})'
)

# Regex for LinkedIn and GitHub profile links
LINKEDIN_PATTERN = re.compile(r'linkedin\.com/in/[\w\-]+')
GITHUB_PATTERN = re.compile(r'github\.com/[\w\-]+')
