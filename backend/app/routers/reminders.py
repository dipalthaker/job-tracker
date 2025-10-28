from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timezone
from ..deps import get_db, get_current_user
from ..models import Application, Reminder, User
from ..schemas import ReminderIn, ReminderOut

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.get("/{application_id}", response_model=list[ReminderOut])
def list_reminders(
    application_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    app = (
        db.query(Application)
        .filter(Application.id == application_id, Application.user_id == user.id)
        .first()
    )
    if not app:
        raise HTTPException(404, "Application not found")
    return (
        db.query(Reminder)
        .filter(Reminder.application_id == application_id)
        .order_by(Reminder.due_at.asc())
        .all()
    )


@router.post("", response_model=ReminderOut)
def create_reminder(
    body: ReminderIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    app = (
        db.query(Application)
        .filter(Application.id == body.application_id, Application.user_id == user.id)
        .first()
    )
    if not app:
        raise HTTPException(404, "Application not found")
    r = Reminder(
        id=str(uuid.uuid4()),
        application_id=body.application_id,
        due_at=body.due_at,
        message=body.message,
        sent=False,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.delete("/{reminder_id}")
def delete_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = (
        db.query(Reminder)
        .join(Application, Reminder.application_id == Application.id)
        .filter(Reminder.id == reminder_id, Application.user_id == user.id)
        .first()
    )
    if not r:
        raise HTTPException(404, "Not found")
    db.delete(r)
    db.commit()
    return {"ok": True}


@router.post("/run-due")
def run_due_reminders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # simple local "scheduler" you can hit manually
    now = datetime.now(timezone.utc)
    due = (
        db.query(Reminder)
        .join(Application, Reminder.application_id == Application.id)
        .filter(
            Application.user_id == user.id,
            Reminder.sent.is_(False),
            Reminder.due_at <= now,
        )
        .all()
    )
    for r in due:
        # TODO: integrate email/Slack here
        r.sent = True
    db.commit()
    return {"sent_count": len(due)}
