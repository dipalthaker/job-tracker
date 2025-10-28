from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from ..deps import get_db, get_current_user
from ..models import Application, Stage, StageType, User
from ..schemas import StageIn, StageOut

router = APIRouter(prefix="/stages", tags=["stages"])


@router.get("/{application_id}", response_model=list[StageOut])
def list_stages(
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
        db.query(Stage)
        .filter(Stage.application_id == application_id)
        .order_by(Stage.created_at.desc())
        .all()
    )


@router.post("", response_model=StageOut)
def create_stage(
    body: StageIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    app = (
        db.query(Application)
        .filter(Application.id == body.application_id, Application.user_id == user.id)
        .first()
    )
    if not app:
        raise HTTPException(404, "Application not found")
    s = Stage(
        id=str(uuid.uuid4()),
        application_id=body.application_id,
        type=StageType(body.type),
        scheduled_at=body.scheduled_at,
        outcome=body.outcome,
        notes=body.notes,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@router.delete("/{stage_id}")
def delete_stage(
    stage_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    s = (
        db.query(Stage)
        .join(Application, Stage.application_id == Application.id)
        .filter(Stage.id == stage_id, Application.user_id == user.id)
        .first()
    )
    if not s:
        raise HTTPException(404, "Not found")
    db.delete(s)
    db.commit()
    return {"ok": True}
