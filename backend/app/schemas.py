# app/schemas.py
from __future__ import annotations

from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, EmailStr, HttpUrl, Field, ConfigDict


class DocumentOut(BaseModel):
    id: str
    application_id: str
    file_name: str
    file_type: str
    s3_key: str
    size_bytes: Optional[int] = None
    uploaded_at: datetime
    model_config = {"from_attributes": True}


class DocumentCreate(BaseModel):
    id: Optional[str] = None
    application_id: str
    file_name: str
    file_type: str
    s3_key: str
    size_bytes: Optional[int] = None


# ---------- Auth / User ----------


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None

    # ORM support (SQLAlchemy row -> Pydantic model)
    model_config = ConfigDict(from_attributes=True)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Applications ----------

StatusLiteral = Literal["APPLIED", "OA", "INTERVIEW", "ONSITE", "OFFER", "REJECTED"]


class ApplicationIn(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    source: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    status: StatusLiteral = "APPLIED"
    # keep HttpUrl to enforce a valid URL; switch to Optional[str] if you want looser validation
    job_url: Optional[HttpUrl] = None
    jd_text: Optional[str] = None
    applied_at: Optional[datetime] = None


class ApplicationOut(BaseModel):
    id: str
    company: str
    role: str
    status: StatusLiteral

    # include optional data so it returns in responses
    location: Optional[str] = None
    source: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    job_url: Optional[HttpUrl] = None
    jd_text: Optional[str] = None
    applied_at: Optional[datetime] = None

    last_update_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationQuery(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    status: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None  # <— added so you can filter by location
    q: Optional[str] = None  # free-text across company/role/jd_text
    sort: Optional[str] = None  # e.g. "-last_update_at", "company"


# ---------- S3 presign ----------


class PresignIn(BaseModel):
    file_name: str
    content_type: str
    file_type: str  # "cover_letter" | "resume" | "prep_notes" | "other"
    size_bytes: Optional[int] = None


# ---------- Notes ----------


class NoteIn(BaseModel):
    application_id: str
    content: str


class NoteOut(BaseModel):
    id: str
    application_id: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- Contacts ----------


class ContactIn(BaseModel):
    application_id: str
    name: str
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    notes: Optional[str] = None


class ContactOut(BaseModel):
    id: str
    application_id: str
    name: str
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------- Stages ----------

StageTypeLiteral = Literal["RECRUITER", "TECH_SCREEN", "OA", "ONSITE", "OFFER", "OTHER"]


class StageIn(BaseModel):
    application_id: str
    type: StageTypeLiteral
    scheduled_at: Optional[datetime] = None
    outcome: Optional[str] = None
    notes: Optional[str] = None


class StageOut(BaseModel):
    id: str
    application_id: str
    type: str
    scheduled_at: Optional[datetime] = None
    outcome: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- Reminders ----------


class ReminderIn(BaseModel):
    application_id: str
    due_at: datetime
    message: str


class ReminderOut(BaseModel):
    id: str
    application_id: str
    due_at: datetime
    message: str
    sent: bool

    model_config = ConfigDict(from_attributes=True)


# ---------- Tags ----------


class TagIn(BaseModel):
    name: str


class TagOut(BaseModel):
    id: str
    name: str

    model_config = ConfigDict(from_attributes=True)
