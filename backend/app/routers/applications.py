from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
import uuid
from datetime import datetime
from ..deps import get_db, get_current_user
from ..models import Application, Status, User
from ..schemas import ApplicationIn, ApplicationOut, ApplicationQuery


router = APIRouter(prefix="/applications", tags=["applications"])


def _apply_filters(qs, params: ApplicationQuery, user_id: str):
    qs = qs.filter(Application.user_id == user_id)
    if params.status:
        try:
            qs = qs.filter(Application.status == Status(params.status))
        except ValueError:
            raise HTTPException(400, "Invalid status")
    if params.company:
        qs = qs.filter(Application.company.ilike(f"%{params.company}%"))
    if params.role:
        qs = qs.filter(Application.role.ilike(f"%{params.role}%"))
    if params.q:
        like = f"%{params.q}%"
        qs = qs.filter(
            or_(
                Application.company.ilike(like),
                Application.role.ilike(like),
                Application.jd_text.ilike(like),
            )
        )
    # sorting
    sort = params.sort or "-last_update_at"
    direction = desc if sort.startswith("-") else asc
    field = sort[1:] if sort.startswith("-") else sort
    if not hasattr(Application, field):
        field = "last_update_at"
    qs = qs.order_by(direction(getattr(Application, field)))
    return qs


@router.get("", response_model=list[ApplicationOut])
def list_apps(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = None,
    company: str | None = None,
    role: str | None = None,
    q: str | None = None,
    sort: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    params = ApplicationQuery(
        page=page,
        page_size=page_size,
        status=status,
        company=company,
        role=role,
        q=q,
        sort=sort,
    )
    base = _apply_filters(db.query(Application), params, user.id)
    return base.offset((params.page - 1) * params.page_size).limit(params.page_size).all()


@router.get("/{app_id}", response_model=ApplicationOut)
def get_app(app_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    app = (
        db.query(Application)
        .filter(Application.id == app_id, Application.user_id == user.id)
        .first()
    )
    if not app:
        raise HTTPException(404, "Not found")
    return app


@router.post("", response_model=ApplicationOut)
def create_app(
    body: ApplicationIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    app = Application(
        id=str(uuid.uuid4()),
        user_id=user.id,
        company=body.company,
        role=body.role,
        location=body.location,
        source=body.source,
        salary_min=body.salary_min,
        salary_max=body.salary_max,
        status=Status(body.status),
        job_url=str(body.job_url) if body.job_url else None,
        jd_text=body.jd_text,
        applied_at=body.applied_at,
        last_update_at=datetime.utcnow(),
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


@router.patch("/{app_id}", response_model=ApplicationOut)
def update_app(
    app_id: str,
    body: ApplicationIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    app = (
        db.query(Application)
        .filter(Application.id == app_id, Application.user_id == user.id)
        .first()
    )
    if not app:
        raise HTTPException(404, "Not found")
    data = body.dict(exclude_unset=True)
    if "status" in data:
        data["status"] = Status(data["status"])
    if "job_url" in data and data["job_url"] is not None:
        data["job_url"] = str(data["job_url"])
    for k, v in data.items():
        setattr(app, k, v)
    app.last_update_at = datetime.utcnow()
    db.commit()
    db.refresh(app)
    return app


@router.delete("/{app_id}")
def delete_app(app_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    app = (
        db.query(Application)
        .filter(Application.id == app_id, Application.user_id == user.id)
        .first()
    )
    if not app:
        raise HTTPException(404, "Not found")
    db.delete(app)
    db.commit()
    return {"ok": True}


@router.get("/search", response_model=list[ApplicationOut])
def search_apps(
    q: str,
    limit: int = 20,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    like = f"%{q}%"
    qs = (
        db.query(Application)
        .filter(Application.user_id == user.id)
        .filter(
            or_(
                Application.company.ilike(like),
                Application.role.ilike(like),
                Application.location.ilike(like),
                Application.jd_text.ilike(like),
            )
        )
        .order_by(desc(Application.last_update_at))
        .limit(min(max(limit, 1), 100))
    )
    return qs.all()
