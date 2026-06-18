# Scoring configurations for ATS Engine

# Weights for different parts of the score
WEIGHT_KEYWORDS = 0.45      # Skill matching
WEIGHT_STRUCTURE = 0.25     # Contact info, formatting, and file structure
WEIGHT_SECTIONS = 0.30      # Key sections like Education, Experience, Projects

# Word count limits
MIN_WORD_COUNT = 150
MAX_WORD_COUNT = 1500

# Scoring multipliers
PENALTY_MISSING_EMAIL = -15
PENALTY_MISSING_PHONE = -10
PENALTY_MISSING_LINKEDIN = -5
PENALTY_MISSING_GITHUB = -5
