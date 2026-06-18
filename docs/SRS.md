# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## Project Title
**AI Resume Analyzer & Interview Preparation Platform**

## Version
1.0

## Prepared By
**Manoj Kumar Boggavarapu**

---

# 1. INTRODUCTION

## 1.1 Purpose
The purpose of this project is to develop an AI-powered web application that helps students, freshers, and job seekers analyze their resumes, identify skill gaps, improve ATS scores, receive personalized recommendations, and prepare for interviews.

The system uses Machine Learning, Natural Language Processing (NLP), and Generative AI to evaluate resumes and provide actionable insights.

---

## 1.2 Problem Statement
Many job applicants are rejected before reaching the interview stage because:
* Resumes are not ATS-friendly.
* Important skills are missing.
* Resume formatting is poor.
* Candidates lack interview preparation.
* There is no personalized career guidance.

This project addresses these challenges through AI-driven resume analysis and interview coaching.

---

## 1.3 Objectives
* Analyze uploaded resumes automatically.
* Calculate ATS compatibility score.
* Identify missing skills.
* Match resumes with job descriptions.
* Generate interview questions.
* Provide resume improvement suggestions.
* Offer AI-powered career guidance.

---

# 2. SYSTEM OVERVIEW

## Product Name
AI Resume Analyzer & Interview Coach

## Target Users
* Students
* Freshers
* Job Seekers
* Placement Cells
* Recruiters

---

# 3. TECHNOLOGY STACK

## Frontend
* React.js
* Tailwind CSS
* Axios
* React Router

## Backend
* Spring Boot
* REST APIs
* JWT Authentication

## AI/ML Layer
* Python
* Scikit-Learn
* NLTK
* SpaCy
* Transformers
* Gemini API

## Database
* PostgreSQL

## Cloud Deployment
* Docker
* GitHub Actions
* AWS / GCP

---

# 4. SYSTEM ARCHITECTURE

```text
User
 |
React Frontend
 |
Spring Boot APIs
 |
PostgreSQL Database
 |
Python ML Service
 |
Gemini API
```

---

# 5. FUNCTIONAL REQUIREMENTS

## Module 1: User Authentication
### Features
* Registration
* Login
* Logout
* Forgot Password
* Profile Management

### Inputs
* Name
* Email
* Password

### Outputs
* Secure User Account

---

## Module 2: Resume Upload
### Features
* PDF Upload
* DOCX Upload
* Resume Storage

### Inputs
* Resume File

### Outputs
* Parsed Resume Data

---

## Module 3: Resume Parsing
### Extract Information
* Name
* Email
* Phone Number
* Skills
* Education
* Experience
* Certifications
* Projects

### Technologies
* SpaCy
* NLP
* Regex

---

## Module 4: ATS Score Calculator
### Analyze
* Keywords
* Formatting
* Skills
* Experience
* Education

### Output
ATS Score (0–100)

Example:
```text
ATS Score: 84/100
```

---

## Module 5: Skill Gap Analysis
### Features
Compare:
Resume Skills
VS
Job Description Skills

### Output
```text
Present Skills:
Java
SQL
React

Missing Skills:
Docker
AWS
Kubernetes
```

---

## Module 6: Job Matching Engine
### Features
* Job Recommendation
* Resume Matching

### Algorithms
* TF-IDF
* Cosine Similarity
* BERT Embeddings

### Output
```text
Software Engineer
Match Score: 91%

Java Developer
Match Score: 86%

Backend Developer
Match Score: 80%
```

---

## Module 7: AI Resume Suggestions
### Features
AI generates:
* Better Summary
* Improved Project Descriptions
* Skill Recommendations
* Resume Formatting Tips

### Example
Before:
```text
Built a website.
```
After:
```text
Developed a responsive web application using React.js and Spring Boot, improving user engagement by 35%.
```

---

## Module 8: Interview Question Generator
### Features
Generate Questions Based On:
* Skills
* Projects
* Experience

### Example
```text
Explain JWT Authentication.
Difference between SQL and NoSQL?
How does React Virtual DOM work?
```

---

## Module 9: AI Mock Interview
### Features
* Voice Interview
* Text Interview
* AI Evaluation

### Evaluation
* Technical Knowledge
* Communication
* Confidence
* Problem Solving

---

## Module 10: Career Guidance
### Features
* Career Path Recommendation
* Learning Roadmap
* Certification Suggestions

Example:
```text
Current Role:
Java Developer

Recommended Learning:
Spring Boot
Docker
AWS
Microservices
```

---

# 6. MACHINE LEARNING MODULES

## ML Model 1
Resume Category Prediction
Categories:
* Software Engineer
* Data Analyst
* Data Scientist
* AI Engineer
* Web Developer

Algorithm:
* Random Forest
* XGBoost

---

## ML Model 2
ATS Score Prediction
Inputs:
* Skills
* Keywords
* Experience

Output:
* ATS Score

Algorithm:
* Gradient Boosting

---

## ML Model 3
Job Matching Engine
Algorithm:
* TF-IDF
* Cosine Similarity
* BERT

---

## ML Model 4
Interview Performance Prediction
Input:
* Answers
* Communication Score

Output:
* Readiness Score

---

# 7. DATABASE DESIGN

## Users Table
```sql
UserID
Name
Email
Password
Role
CreatedAt
```

---

## Resumes Table
```sql
ResumeID
UserID
ResumePath
ATSScore
CreatedAt
```

---

## Skills Table
```sql
SkillID
ResumeID
SkillName
```

---

## Interview Table
```sql
InterviewID
UserID
Score
Feedback
CreatedAt
```

---

# 8. NON-FUNCTIONAL REQUIREMENTS

## Security
* JWT Authentication
* Password Encryption
* HTTPS
* SQL Injection Protection

## Performance
* Response Time < 3 Seconds
* Concurrent Users > 1000

## Reliability
* 99% Availability

## Scalability
* Cloud Deployment
* Docker Containers

---

# 9. FUTURE ENHANCEMENTS
* AI Video Interview Analysis
* Facial Expression Analysis
* LinkedIn Profile Analysis
* Real-Time Recruiter Dashboard
* AI Cover Letter Generator
* Multi-Language Resume Analysis

---

# 10. EXPECTED OUTCOME
The system will:
* Increase resume quality.
* Improve ATS scores.
* Enhance interview preparation.
* Recommend suitable jobs.
* Provide personalized career guidance.
* Help students secure better placements.
