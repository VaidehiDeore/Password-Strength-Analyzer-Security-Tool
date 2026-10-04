# 🔐 Password Strength Analyzer & Security Suggestion Tool

A full-stack defensive cybersecurity application that analyzes password strength in real time, detects common security weaknesses, provides personalized security recommendations, and generates stronger passwords without storing or transmitting plaintext passwords.

## 📌 Overview

The Password Strength Analyzer & Security Suggestion Tool demonstrates practical password-security concepts relevant to:

- Authentication Security
- Identity & Access Management (IAM)
- Application Security
- Secure Coding
- Security Awareness
- Defensive Cybersecurity

The system evaluates passwords using multiple security signals rather than relying on password length alone.

> Privacy-first design: Passwords are analyzed in memory and are not stored, logged, or transmitted to external services by default.

## 🎯 Objectives

- Analyze password strength using multiple security indicators.
- Detect common and predictable passwords.
- Identify repetition, sequences, and keyboard patterns.
- Detect optional personal-context overlap locally.
- Provide actionable security suggestions.
- Generate secure random passwords.
- Display aggregate password-security analytics.
- Demonstrate secure password-handling practices.

## ✨ Features

### 🔍 Real-Time Password Analyzer

The analyzer evaluates:

- Password length
- Lowercase characters
- Uppercase characters
- Numbers
- Symbols
- Spaces
- Unique characters
- Character diversity
- Unique-character ratio
- Repeated characters and substrings
- Sequential numbers and letters
- Keyboard patterns
- Common passwords
- Dictionary words
- Predictable prefixes/suffixes
- Word + year/date patterns
- Optional personal-context matches

### 📊 Strength Score

The project uses a 0–100 project-defined score.

| Score | Classification |
|------:|----------------|
| 0–20 | VERY WEAK |
| 21–40 | WEAK |
| 41–60 | MODERATE |
| 61–80 | STRONG |
| 81–100 | VERY STRONG |

The scoring model considers:

- Length
- Character diversity
- Unique-character ratio
- Pattern resistance
- Common-password detection
- Unpredictability

The score is specific to this project and is not an industry-standard password score.

### 🧩 Pattern Detection

The system detects patterns such as:

    1234
    5678
    abcd
    9876
    qwerty
    asdf
    aaaa
    1111
    ababab

It also detects predictable structures such as:

    password123
    welcome123
    admin2026
    hello1234

### 📚 Common Password Detection

A local educational dictionary is provided through:

    data/common_passwords.txt

No external password database is required for normal operation.

### 🔢 Entropy Estimation

The project provides an educational entropy estimate:

    H ≈ L × log2(N)

where:

- L = password length
- N = estimated character-set size

This is treated as an estimate because human-created passwords can be significantly more predictable than theoretical entropy suggests.

### 💡 Security Suggestions

Recommendations are generated according to detected weaknesses, including:

- Increase password length.
- Use a long unique password or passphrase.
- Avoid common passwords.
- Avoid keyboard patterns.
- Avoid sequences and repetition.
- Avoid predictable years and dates.
- Avoid personal information.
- Enable MFA where available.
- Use a password manager where appropriate.

### 🔑 Secure Password Generator

The generator uses Python's `secrets` module and supports:

- 16-character passwords
- 20-character passwords
- 24-character passwords
- Uppercase letters
- Lowercase letters
- Numbers
- Symbols

Generated passwords are not stored.

### 📈 Analytics Dashboard

The dashboard provides aggregate security analytics such as:

- Total analyses
- Average score
- Strength distribution
- Weakness distribution
- Password-length statistics

Only security metadata is used for analytics.

## 🏗️ Architecture

    User
      │
      ▼
    React Web Interface
      │
      ▼
    FastAPI Backend
      │
      ├── Password Analyzer
      │     ├── Length Analysis
      │     ├── Character Diversity
      │     ├── Pattern Detection
      │     ├── Common Password Detection
      │     ├── Repetition Detection
      │     └── Context Matching
      │
      ├── Strength Scoring
      ├── Recommendation Engine
      ├── Password Generator
      └── Aggregate Analytics
                │
                ▼
             SQLite

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- Recharts
- Lucide React
- CSS

### Backend
- Python
- FastAPI
- Uvicorn

### Database
- SQLite

### Testing
- Pytest

### Security
- Python `secrets`
- Password analysis rules
- Entropy estimation
- SHA-1 demonstration hashes
- Secure password-handling principles

## 📁 Project Structure

    Password-Strength-Analyzer/
    │
    ├── backend/
    │   ├── app.py
    │   ├── __main__.py
    │   ├── requirements.txt
    │   └── services/
    │       ├── analytics.py
    │       ├── password_analyzer.py
    │       ├── password_generator.py
    │       └── security_demo.py
    │
    ├── frontend/
    │   ├── index.html
    │   ├── package.json
    │   ├── vite.config.js
    │   └── src/
    │       ├── App.jsx
    │       ├── main.jsx
    │       ├── styles.css
    │       └── lib/
    │           └── api.js
    │
    ├── data/
    │   ├── common_passwords.txt
    │   ├── demo_breached_password_hashes.txt
    │   └── README.md
    │
    ├── tests/
    ├── docs/
    ├── reports/
    ├── screenshots/
    │
    ├── .env.example
    ├── .gitignore
    └── README.md

## 🔐 Privacy & Security Design

Privacy is a core requirement of the project.

The application:

- Does not store plaintext passwords.
- Does not log passwords.
- Does not place passwords in URLs.
- Does not store passwords in `localStorage` or `sessionStorage`.
- Does not transmit passwords to external services by default.
- Performs password analysis in memory.
- Stores only aggregate analytics metadata.

Analytics contain fields such as:

    analysis_id
    score
    classification
    password_length
    unique_character_ratio
    weakness_count
    created_at

The project also demonstrates password-security concepts including:

- Salting
- Key stretching
- Argon2id
- bcrypt
- scrypt
- PBKDF2
- Multi-factor authentication

## 🚀 Installation

### 1. Clone the Repository

    git clone https://github.com/<your-username>/Password-Strength-Analyzer-Security-Tool.git
    cd Password-Strength-Analyzer-Security-Tool

### 2. Backend Setup

    cd backend
    python -m venv .venv

Windows:

    .venv\Scripts\activate

Install dependencies:

    pip install -r requirements.txt

Start the backend from the project root:

    cd ..
    python -m uvicorn backend.app:app --reload --port 8000

Backend:

    http://127.0.0.1:8000

Swagger API documentation:

    http://127.0.0.1:8000/docs

### 3. Frontend Setup

Open another terminal:

    cd frontend
    npm install
    npm run dev

Frontend:

    http://localhost:5173

## 🔌 API Endpoints

### Analyze Password

    POST /api/analyze

Request:

    {
      "password": "ExamplePassword123!"
    }

Response structure:

    {
      "score": 0,
      "classification": "",
      "findings": [],
      "suggestions": [],
      "metrics": {}
    }

### Dashboard Statistics

    GET /api/dashboard/stats

### Weakness Analytics

    GET /api/analytics/weaknesses

### Generate Password

    POST /api/generate-password

## 🧪 Testing

Run the test suite from the project root:

    pytest -q

The project includes tests covering the password analyzer, API behavior, generator, and security-related functionality.

## 📸 Screenshots

The main portfolio screenshots are:

    screenshots/
    ├── 01-dashboard-analytics.png
    ├── 02-password-analyzer.png
    ├── 03-strong-password-analysis.png
    ├── 04-password-generator.png
    └── 05-api-docs.png

These demonstrate the major application workflows and backend API documentation.

## ⚠️ Limitations

- Password strength cannot be perfectly determined using one formula.
- Entropy is an educational estimate.
- The common-password dataset is intentionally limited for educational use.
- The local breach-hash dataset is a demonstration and is not a production breach database.
- The scoring system is project-defined.
- External breach checking is not enabled by default.
- The application is not a replacement for a production authentication system.

## 🔮 Future Improvements

- Larger curated password dictionaries.
- Privacy-preserving production breach checking using k-anonymity.
- More advanced pattern detection.
- Configurable organizational password policies.
- PostgreSQL support.
- Production HTTPS deployment.
- Authentication and administrator controls.
- Advanced security analytics.
- Expanded security-awareness modules.

## 🎓 Learning Outcomes

This project demonstrates practical understanding of:

- Password security
- Authentication security
- Secure coding
- REST API development
- React frontend development
- FastAPI
- SQLite
- Password entropy
- Pattern detection
- Secure random generation
- Privacy-first application design
- Security testing
- Defensive cybersecurity

## ⚠️ Security Disclaimer

This project is intended strictly for educational, defensive, and cybersecurity-awareness purposes.

Use only synthetic or authorized test data.

The project must not be used for:

- Credential theft
- Password cracking
- Credential stuffing
- Attacking real accounts
- Unauthorized authentication bypass
- Collecting passwords without authorization

Production authentication systems should additionally use secure password hashing, salting, MFA, rate limiting, secure session management, phishing protection, abuse prevention, and monitoring.

## 👩‍💻 Author

**Vaidehi Deore**
