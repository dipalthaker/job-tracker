from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from ..deps import get_db, get_current_user
from ..models import Application, Contact, User
from ..schemas import ContactIn, ContactOut

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("/{application_id}", response_model=list[ContactOut])
def list_contacts(
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
    return db.query(Contact).filter(Contact.application_id == application_id).all()


@router.post("", response_model=ContactOut)
def create_contact(
    body: ContactIn,
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
    c = Contact(
        id=str(uuid.uuid4()),
        application_id=body.application_id,
        name=body.name,
        email=body.email,
        role=body.role,
        notes=body.notes,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{contact_id}")
def delete_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = (
        db.query(Contact)
        .join(Application, Contact.application_id == Application.id)
        .filter(Contact.id == contact_id, Application.user_id == user.id)
        .first()
    )
    if not c:
        raise HTTPException(404, "Not found")
    db.delete(c)
    db.commit()
    return {"ok": True}
