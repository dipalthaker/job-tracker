from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from ..deps import get_db, get_current_user
from ..models import Application, Note, User
from ..schemas import NoteIn, NoteOut

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("/{application_id}", response_model=list[NoteOut])
def list_notes(
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
        db.query(Note)
        .filter(Note.application_id == application_id)
        .order_by(Note.created_at.desc())
        .all()
    )


@router.post("", response_model=NoteOut)
def create_note(
    body: NoteIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    app = (
        db.query(Application)
        .filter(Application.id == body.application_id, Application.user_id == user.id)
        .first()
    )
    if not app:
        raise HTTPException(404, "Application not found")
    n = Note(
        id=str(uuid.uuid4()),
        application_id=body.application_id,
        user_id=user.id,
        content=body.content,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


@router.delete("/{note_id}")
def delete_note(
    note_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    n = (
        db.query(Note)
        .join(Application, Note.application_id == Application.id)
        .filter(Note.id == note_id, Application.user_id == user.id)
        .first()
    )
    if not n:
        raise HTTPException(404, "Not found")
    db.delete(n)
    db.commit()
    return {"ok": True}
