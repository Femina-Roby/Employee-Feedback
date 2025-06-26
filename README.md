# Employee Feedback System

A role-based feedback platform for managers and employees — built with React, FastAPI, and Docker. It facilitates structured communication, sentiment tracking, and acknowledgement workflows across teams.

---

## Live Demo (optional)

Add these after deploying to Vercel/Render:

- Frontend: https://employee-feedback-phi.vercel.app/
- Backend: https://your-backend.onrender.com

---

## Features

- Role-based login (Manager / Employee)
- Managers can give feedback to employees
- Employees can acknowledge received feedback
- Sentiment breakdown (positive / neutral / negative)
- Smart dashboard summaries for managers
- Clean, responsive UI built with usability in mind

---

## Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Frontend  | React.js, React Router   |
| Backend   | FastAPI, Python          |
| Database  | SQLite (switchable to PostgreSQL) |
| Styling   | Tailwind CSS / Inline CSS |
| Deployment | Vercel (UI), Render (API) |
| Dev Tools | Docker, Git, VS Code     |

---

## Setup Instructions

### Clone the Project

```bash
git clone https://github.com/Femina-Roby/Employee-Feedback.git
cd Employee-Feedback

#Backend Setup
#With Docker:

cd backend
docker build -t feedback-api .
docker run -p 8000:8000 feedback-api

#Or manually:

cd backend
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload

#Optional .env:

DATABASE_URL=sqlite:///./feedback.db

#Frontend Setup

cd frontend
npm install
npm start

#Dockerfile (Backend)
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

#Place this in your backend directory.



