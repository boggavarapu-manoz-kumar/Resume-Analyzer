-- Database Schema for AI Resume Analyzer & Interview Prep Platform

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    resume_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    resume_path VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    ats_score INTEGER CHECK (ats_score BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Skills Table
CREATE TABLE IF NOT EXISTS skills (
    skill_id SERIAL PRIMARY KEY,
    resume_id INTEGER REFERENCES resumes(resume_id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL
);

-- Create Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
    interview_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    resume_id INTEGER REFERENCES resumes(resume_id) ON DELETE CASCADE,
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    feedback TEXT,
    transcript TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Jobs Table (Mock jobs for matching engine)
CREATE TABLE IF NOT EXISTS jobs (
    job_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT NOT NULL, -- Comma-separated or JSON list
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
