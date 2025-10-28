venv:
	python3 -m venv backend/.venv

install:
	. backend/.venv/bin/activate && pip install -U pip && pip install -r backend/requirements.txt

freeze:
	. backend/.venv/bin/activate && pip freeze > backend/requirements.txt

migrate:
	cd backend && . .venv/bin/activate && alembic upgrade head

revision:
	cd backend && . .venv/bin/activate && alembic revision -m "$(m)" --autogenerate

seed:
	cd backend && . .venv/bin/activate && python -m app.seeds

run-api:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --log-level info

web:
	cd frontend && npm install && npm run dev

lint-py:
	cd backend && . .venv/bin/activate && ruff check . && mypy app || true

format-py:
	cd backend && . .venv/bin/activate && ruff format .

lint-js:
	cd frontend && npm run lint || true

format-js:
	cd frontend && npm run format || true

pg:
	docker ps | grep jt-pg || docker run --name jt-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=jobtracker -p 5433:5432 -d postgres:16

pgweb:
	docker run --rm -p 8081:8081 sosedoff/pgweb --host=$(shell ipconfig getifaddr en0) --user=postgres --db=jobtracker --pass=postgres --port=5433

reset-db:
	cd backend && . .venv/bin/activate && python -c "from app.db import engine; from app.models import Base; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine); print('DB reset complete.')"


# ------------------------------------------------------
# Start everything (DB + Backend + Frontend)
# ------------------------------------------------------
start:
	@echo "🚀 Starting Job Tracker..."
	@docker start jt-pg || (echo "🐘 Starting new Postgres container..." && docker run --name jt-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=jobtracker -p 5433:5432 -d postgres:16)
	@echo "🐍 Starting backend..."
	@source backend/.venv/bin/activate && cd backend && uvicorn app.main:app --reload &
	@sleep 3
	@echo "💻 Starting frontend..."
	@cd frontend && npm run dev
