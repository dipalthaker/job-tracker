🧠 Job Tracker

A lightweight job application tracker built with FastAPI, React (Vite), and PostgreSQL.








📋 Overview

Job Tracker helps users manage and monitor their job applications efficiently.
It combines a FastAPI backend, a React/Vite frontend, and a PostgreSQL database (via Docker) into one clean, modular system.

✨ Features

Track job applications, stages, notes, and reminders

REST API with JWT-based authentication

Modern, responsive React UI

PostgreSQL database with SQLAlchemy ORM

Simple Makefile for setup and maintenance

Pre-commit hooks, linting (Ruff), and typing (Mypy)

⚙️ Tech Stack
Layer	Technology
Frontend	React + Vite + TypeScript
Backend	FastAPI + SQLAlchemy + Pydantic
Database	PostgreSQL (via Docker)
Dev Tools	Docker, Makefile, Ruff, Mypy, Pre-commit
🚀 Local Setup
1️⃣ Prerequisites

Python 3.11+

Node.js 18+

Docker Desktop (for PostgreSQL)

2️⃣ Start PostgreSQL (Docker)

Run the container:

docker run --name jt-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=jobtracker \
  -p 5433:5432 -d postgres:16


Your database is now accessible at
postgresql://postgres:postgres@localhost:5433/jobtracker

3️⃣ Backend Setup

From the repo root:

make venv
make install


Create a file: backend/.env

DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5433/jobtracker
JWT_SECRET=dev_secret_change_me
JWT_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=http://localhost:5173
LOG_LEVEL=info


Run migrations to create tables:

make migrate


Run the backend:

make run-api


Server runs at http://127.0.0.1:8000/docs

4️⃣ Frontend Setup

In a new terminal:

cd frontend
npm install
npm run dev


Opens http://localhost:5173

🧹 Developer Commands
Command	Description
make venv	Create a Python virtual environment
make install	Install backend dependencies
make migrate	Apply database migrations
make reset-db	Drop and recreate all tables
make run-api	Start FastAPI backend
make lint-py	Run Ruff & Mypy checks
pre-commit run --all-files	Run all format and lint checks
🌍 Deployment (Optional)

To deploy publicly:

Host the backend on Render

Use Neon
 or Supabase
 for Postgres

Deploy the frontend on Vercel

📄 License

MIT License © 2025 Dipal Thaker
