from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from ..deps import get_db, get_current_user
from ..models import Tag, Application, User
from ..schemas import TagIn, TagOut

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=list[TagOut])
def list_tags(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Tag).order_by(Tag.name.asc()).all()


@router.post("", response_model=TagOut)
def create_tag(body: TagIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if db.query(Tag).filter(Tag.name.ilike(body.name)).first():
        raise HTTPException(400, "Tag already exists")
    t = Tag(id=str(uuid.uuid4()), name=body.name)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.post("/assign/{application_id}/{tag_id}")
def assign_tag(
    application_id: str,
    tag_id: str,
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
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(404, "Tag not found")
    if tag not in app.tags:
        app.tags.append(tag)
        db.commit()
    return {"ok": True}


@router.delete("/assign/{application_id}/{tag_id}")
def unassign_tag(
    application_id: str,
    tag_id: str,
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
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(404, "Tag not found")
    if tag in app.tags:
        app.tags.remove(tag)
        db.commit()
    return {"ok": True}
