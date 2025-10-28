import enum
from datetime import datetime
from typing import List, Optional

from sqlalchemy import String, DateTime, Enum as SAEnum, ForeignKey, Boolean, Text, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship, column_property

from .db import Base


class Status(str, enum.Enum):
    APPLIED = "APPLIED"
    OA = "OA"
    INTERVIEW = "INTERVIEW"
    ONSITE = "ONSITE"
    OFFER = "OFFER"
    REJECTED = "REJECTED"


# many-to-many between applications and tags
application_tags = Table(
    "application_tags",
    Base.metadata,
    Column("application_id", ForeignKey("applications.id"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    password_hash: Mapped[str] = mapped_column(String)

    applications: Mapped[List["Application"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    company: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String)
    location: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[Status] = mapped_column(SAEnum(Status), default=Status.APPLIED)
    job_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    jd_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # used in routers
    applied_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_update_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user: Mapped["User"] = relationship(back_populates="applications")

    documents: Mapped[List["Document"]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    stages: Mapped[List["Stage"]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    contacts: Mapped[List["Contact"]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    notes: Mapped[List["Note"]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    reminders: Mapped[List["Reminder"]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    tags: Mapped[List["Tag"]] = relationship(
        secondary=application_tags, back_populates="applications"
    )


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    application_id: Mapped[str] = mapped_column(ForeignKey("applications.id"), index=True)
    key: Mapped[str] = mapped_column(String)
    filename: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    # --- Aliases expected by routers (no migration needed) ---
    uploaded_at: Mapped[datetime] = column_property(created_at)  # NEW
    s3_key: Mapped[str] = column_property(key)  # NEW
    application: Mapped["Application"] = relationship(back_populates="documents")


class StageType(str, enum.Enum):
    RECRUITER = "RECRUITER"
    TECH_SCREEN = "TECH_SCREEN"
    OA = "OA"
    ONSITE = "ONSITE"
    OFFER = "OFFER"
    OTHER = "OTHER"


class Stage(Base):
    __tablename__ = "stages"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    application_id: Mapped[str] = mapped_column(ForeignKey("applications.id"), index=True)
    type: Mapped[StageType] = mapped_column(SAEnum(StageType))
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    outcome: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    application: Mapped["Application"] = relationship(back_populates="stages")


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    application_id: Mapped[str] = mapped_column(ForeignKey("applications.id"), index=True)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    role: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    application: Mapped["Application"] = relationship(back_populates="contacts")


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    application_id: Mapped[str] = mapped_column(ForeignKey("applications.id"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    application: Mapped["Application"] = relationship(back_populates="notes")


class Reminder(Base):
    __tablename__ = "reminders"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    application_id: Mapped[str] = mapped_column(ForeignKey("applications.id"), index=True)
    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    message: Mapped[str] = mapped_column(Text)
    sent: Mapped[bool] = mapped_column(Boolean, default=False)

    application: Mapped["Application"] = relationship(back_populates="reminders")


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True)

    applications: Mapped[List["Application"]] = relationship(
        secondary=application_tags, back_populates="tags"
    )
