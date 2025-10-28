Job Tracker (FastAPI + React + Postgres)

Lightweight job application tracker for personal use.
Backend: FastAPI + SQLAlchemy (typed, SA 2.0) • Frontend: React/Vite • DB: Postgres (Docker)

Prerequisites

Python 3.11+

Node.js 18+ (for the frontend)

Docker (for Postgres)

1) Start PostgreSQL (Docker)
docker run --name jt-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=jobtracker \
  -p 5433:5432 -d postgres:16


This exposes Postgres at postgresql://postgres:postgres@localhost:5433/jobtracker.

2) Backend setup

From repo root:

make venv
make install


Create backend/.env:

# backend/.env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5433/jobtracker
JWT_SECRET=change-me-in-prod
JWT_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=http://localhost:5173
LOG_LEVEL=info


Run migrations / create tables:

make migrate


Run API:

make run-api
# http://127.0.0.1:8000


Optional: reset DB

make reset-db

3) Frontend setup

From repo root, in a new terminal:

make web
# http://localhost:5173

Makefile cheatsheet
make venv        # create virtualenv at backend/.venv
make install     # install backend deps from backend/requirements.txt
make migrate     # run alembic upgrade head
make run-api     # start FastAPI with reload
make reset-db    # drop & recreate tables (dev only)
make lint-py     # ruff + mypy (via venv)
make format-py   # ruff format
make web         # start frontend (npm install + dev)


Postgres helpers:

docker ps (check container)

docker logs jt-pg | head (health)

docker exec -it jt-pg psql -U postgres -d jobtracker -c "\dt" (list tables)

Project structure
job-tracker/
  backend/
    app/
      routers/        # auth, applications, tags, notes, contacts, stages, reminders, documents
      models.py       # SQLAlchemy 2.0 typed models (Mapped[...])
      db.py           # engine, SessionLocal, Declarative Base
      config.py       # Pydantic BaseSettings (reads backend/.env)
      security.py     # JWT, password hashing
      main.py         # FastAPI app, CORS
    alembic/          # migrations
    .venv/            # virtual environment
    requirements.txt
    pyproject.toml    # ruff + mypy config
  frontend/
    ...               # Vite + React app
  Makefile
  .pre-commit-config.yaml
  README.md

Code quality

Install pre-commit (once, inside venv):

source backend/.venv/bin/activate
pip install pre-commit
pre-commit install
pre-commit run --all-files


Ruff: lint + format

Mypy: type-check with SQLAlchemy plugin

Environment variables

DATABASE_URL
postgresql+psycopg2://<user>:<pass>@localhost:5433/jobtracker

JWT_SECRET
Any long random string (e.g., from openssl rand -hex 32)

JWT_EXPIRE_MINUTES
Defaults to 10080 (7 days)

ALLOWED_ORIGINS
http://localhost:5173 during dev

Common workflows

Create a new migration (after changing models):

cd backend
. .venv/bin/activate
alembic revision -m "your message" --autogenerate
alembic upgrade head


Seed dev data (if a seed script exists):

make seed

Troubleshooting

Port conflict on Postgres: change the left side of -p 5433:5432 to another free port and update DATABASE_URL accordingly.

Docker not running: start Docker Desktop first; then docker ps should list containers.

Ruff/Mypy not found: run inside venv (source backend/.venv/bin/activate) or use full paths backend/.venv/bin/ruff, etc.

CORS errors in frontend: ensure ALLOWED_ORIGINS=http://localhost:5173 and API runs at http://127.0.0.1:8000.

License

Personal project — use at your own discretion.