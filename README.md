<div align="center">

<img src="https://img.shields.io/badge/AI%20Powered-Resume%20Analyzer-3b82f6?style=for-the-badge&logo=openai&logoColor=white" alt="AI Resume Analyzer"/>

# 🚀 ResumeAI — Elevate Your Career with AI Precision

**The most intelligent resume analysis platform built for the modern job market.**  
Upload your resume. Get instant AI feedback. Land your dream job.

[![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Java](https://img.shields.io/badge/Java-17+-orange?style=flat-square&logo=openjdk)](https://adoptium.net/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)

---

</div>

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **AI Resume Analysis** | Deep qualitative feedback powered by Google Gemini. Scores your resume against ATS and industry standards. |
| 📊 **Skill Gap Analysis** | Identifies exactly which skills you're missing for your target role, with a step-by-step learning roadmap. |
| 💼 **Intelligent Job Matching** | NLP-powered semantic matching that cross-references your profile against curated live job listings. |
| 🗺️ **Career Roadmap Generator** | AI-built, personalized step-by-step progression plans from your current role to your dream career. |
| 🎤 **Mock Interview Coach** | AI-generated interview questions tailored to your specific resume and target role. |
| ⚡ **Instant Results** | Session-cached AI responses ensure **instantaneous** navigation between all feature pages. |

---

## 🖥️ Live Preview

> **Framer-quality UI** with buttery-smooth animations, floating frosted-glass navbar, and a Bento Box feature grid.

```
Floating Navbar ──► Glassmorphism Pill with Active Link Indicators
Hero Section   ──► Bold Gradient Typography with Staggered Fade-Up Animations  
Bento Grid     ──► 12-Column Asymmetric Feature Showcase with Hover Glow Effects
AI Chat UI     ──► Conversational Document-Style Analysis Pages
```

---

## 🏗️ Architecture

```
ai-resume-analyzer/
├── frontend/                   # React 18 + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard/      # Framer-style Landing Page
│   │   │   ├── UploadResume/   # AI-powered file parser
│   │   │   ├── ResumeAnalysis/ # Conversational AI feedback
│   │   │   ├── JobMatching/    # NLP-based job recommendations
│   │   │   ├── SkillGap/       # Gap analysis & learning paths
│   │   │   └── CareerRoadmap/  # AI career progression planner
│   │   └── assets/styles/      # Production CSS design system
│
├── backend/                    # Spring Boot 3 (Java 17)
│   └── src/main/java/
│       └── com/resumeanalyzer/
│           ├── controller/     # REST API endpoints
│           ├── service/        # Business logic & AI orchestration
│           └── repository/     # JPA Data Access Layer
│
└── ai-service/                 # FastAPI (Python)
    ├── main.py                 # API entry point
    ├── routes/                 # Analysis, extraction, job matching
    └── utils/
        └── gemini_client.py    # Google Gemini AI with exponential backoff
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Lucide Icons |
| **Backend API** | Spring Boot 3, Spring Security, JWT Auth, JPA/Hibernate |
| **AI Service** | FastAPI, Google Gemini 2.0 Flash, Python 3.12 |
| **Database** | MySQL / PostgreSQL |
| **File Parsing** | PDFPlumber, python-docx |
| **Styling** | Vanilla CSS — Custom Design System (No TailwindCSS) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `>= 18.x`
- **Java** `>= 17`
- **Python** `>= 3.12`
- **MySQL/PostgreSQL** running locally
- A **Google Gemini API Key** ([Get one here](https://aistudio.google.com/))

---

### 1. Clone the Repository

```bash
git clone https://github.com/boggavarapu-manoz-kumar/Resume-Analyzer.git
cd Resume-Analyzer
```

### 2. Configure Environment Variables

**Backend** (`backend/src/main/resources/application.properties`):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/resume_analyzer
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD
jwt.secret=YOUR_JWT_SECRET_HERE
ai.service.url=http://localhost:8000
```

**AI Service** (`.env` in `/ai-service/`):
```env
GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY
```

### 3. Start All Services

**AI Service (FastAPI):**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Backend (Spring Boot):**
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend (React + Vite):**
```bash
cd frontend
npm install
npm run dev
```

> Open **http://localhost:5173** to see the app. 🎉

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `POST` | `/api/resumes/upload` | Upload & analyze a resume file |
| `GET` | `/api/resumes/my-resumes` | Fetch user's analyzed resumes |
| `POST` | `/analyze` *(AI Service)* | Deep AI analysis of resume text |
| `POST` | `/match-jobs` *(AI Service)* | Find matching jobs via NLP |
| `POST` | `/skill-gap` *(AI Service)* | Generate skill gap report |

---

## 🗺️ Roadmap

- [x] AI Resume Analysis (Google Gemini)
- [x] Skill Gap Analysis with Learning Path
- [x] Intelligent Job Matching
- [x] Career Roadmap Generator
- [x] Mock Interview Coach
- [ ] Chrome Extension for 1-click analysis on job boards
- [ ] LinkedIn profile integration
- [ ] Real-time job board API scraping
- [ ] Resume auto-optimizer (AI rewrites your resume)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your Feature Branch: `git checkout -b feature/AmazingFeature`
3. Commit your Changes: `git commit -m 'feat: Add some AmazingFeature'`
4. Push to the Branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ using Google Gemini AI, Spring Boot & React**

*If this project helped you, please give it a ⭐ on GitHub!*

</div>
