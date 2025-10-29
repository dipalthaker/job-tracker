<h1 align="center">💼 Job Tracker</h1>

<p align="center" style="font-size:18px;">
A full-stack web application to organize, track, and analyze job applications.<br>
Built with <b>FastAPI</b> · <b>React (Vite)</b> · <b>PostgreSQL</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-Backend-brightgreen" />
  <img src="https://img.shields.io/badge/React-Frontend-blue" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-lightblue" />
  <img src="https://img.shields.io/badge/Alembic-Migrations-yellow" />
  <img src="https://img.shields.io/badge/Deployed%20Ready-Render%20|%20Vercel%20|%20Neon-orange" />
</p>

---

<h2>🧭 Overview</h2>

<p style="font-size:16px;">
Searching and applying for jobs can get chaotic — this project simplifies that.<br>
The <b>Job Tracker</b> helps users manage their applications across stages such as 
“Applied”, “Interviewing”, “Offer”, or “Rejected”, all in one centralized dashboard.
</p>

✨ **Key Highlights**
- ✅ Create, update, and delete job applications  
- 🔐 JWT-based user authentication  
- 🧩 RESTful FastAPI backend  
- 💾 PostgreSQL database with Alembic migrations  
- ⚛️ React frontend built with Vite for a fast and modern UI  
- 🌐 Secure cross-origin (CORS) integration between frontend and backend  
- 🧠 Clear modular architecture and environment-based configuration  

---

<h2>🧰 Tech Stack</h2>

| Layer | Technology |
|-------|-------------|
| **Frontend** | React (Vite), Axios, React Router, TailwindCSS |
| **Backend** | FastAPI, SQLAlchemy ORM, Alembic, JWT Auth, Pydantic |
| **Database** | PostgreSQL (Neon or local), Async CRUD operations |
| **Infra / DevOps** | Docker-ready, Render (API), Vercel (Frontend) |

---

<h2>🧱 System Architecture</h2>

```
┌────────────────────┐       ┌────────────────────┐
│     React UI       │ <---> │    FastAPI API     │ <---> PostgreSQL (Neon)
│  (Frontend, Vite)  │       │ (Backend + Auth)   │
└────────────────────┘       └────────────────────┘
```

---

<h2>⚙️ Local Setup</h2>

<h3>1️⃣ Clone the Repository</h3>

```bash
git clone https://github.com/<your-username>/job-tracker.git
cd job-tracker
```

<h3>2️⃣ Backend Setup</h3>

```bash
cd backend
python -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
```

Create a `.env` file:

```bash
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@HOST:PORT/DB?sslmode=require
JWT_SECRET=your_secret_key
JWT_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=http://localhost:5173
```

Run Alembic migrations:

```bash
alembic upgrade head
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend API docs 👉 [http://localhost:8000/docs](http://localhost:8000/docs)

---

<h3>3️⃣ Frontend Setup</h3>

```bash
cd ../frontend
npm install
npm run dev
```

Create `.env.local` file:

```bash
VITE_API_URL=http://localhost:8000
```

Run frontend at 👉 [http://localhost:5173](http://localhost:5173)

---

<h2>🧪 API Endpoints</h2>

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | User login (JWT token issued) |
| `GET` | `/jobs/` | Fetch all jobs for current user |
| `POST` | `/jobs/` | Add a new job entry |
| `PUT` | `/jobs/{id}` | Update existing job |
| `DELETE` | `/jobs/{id}` | Delete a job |

---

<h2>🧠 Learning Highlights</h2>

- Building a full-stack CRUD app with user authentication  
- Designing scalable REST APIs with FastAPI  
- Managing database schema migrations via Alembic  
- Integrating frontend & backend using environment configs  
- Understanding deployment pipelines and CI/CD workflows  
- Applying clean architecture principles and modularity  

---

<h2>📜 License</h2>

MIT License © 2025 **Dipal Thaker**

---

<h2>👩‍💻 Author</h2>

<p align="center" style="font-size:16px;">
<b>Dipal Thaker</b><br>
🎓 Master’s Student, Information Management @ University of Illinois Urbana-Champaign<br>
🔗 <a href="https://linkedin.com/in/dipalthaker2">LinkedIn</a> · 
<a href="https://github.com/dipalthaker">GitHub</a>
</p>
