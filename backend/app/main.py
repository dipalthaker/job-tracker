from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import (
    auth,
    applications,
    documents,
    notes,
    contacts,
    stages,
    reminders,
    tags,
)


app = FastAPI(title="Job Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


app.include_router(documents.router)
app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(notes.router)
app.include_router(contacts.router)
app.include_router(stages.router)
app.include_router(reminders.router)
app.include_router(tags.router)
app.include_router(documents.router)
