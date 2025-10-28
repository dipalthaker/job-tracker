# app/routers/documents.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from ..deps import get_db, get_current_user
from ..models import Document, Application, User
from ..schemas import PresignIn, DocumentOut, DocumentCreate
from ..services.s3 import presign_put, presign_get

router = APIRouter(prefix="/documents", tags=["documents"])


def _ensure_app(db: Session, app_id: str, user_id: str) -> Application:
    app = (
        db.query(Application)
        .filter(Application.id == app_id, Application.user_id == user_id)
        .first()
    )
    if not app:
        raise HTTPException(404, "Application not found")
    return app


@router.get("/{application_id}", response_model=list[DocumentOut])
def list_documents(
    application_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _ensure_app(db, application_id, user.id)
    docs = (
        db.query(Document)
        .filter(Document.application_id == application_id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )
    return docs


@router.post("/{application_id}/presign")
def presign_upload(
    application_id: str,
    body: PresignIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _ensure_app(db, application_id, user.id)
    # return a PUT URL and key for direct upload to S3
    url, key = presign_put(body.file_name, body.content_type)
    return {"upload_url": url, "s3_key": key}


@router.post("", response_model=DocumentOut)
def register_document(
    body: DocumentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # safety: ensure user owns the application
    _ensure_app(db, body.application_id, user.id)
    doc = Document(
        id=body.id,  # allow client to pass id or generate below
        application_id=body.application_id,
        file_name=body.file_name,
        file_type=body.file_type,
        s3_key=body.s3_key,
        size_bytes=body.size_bytes,
        uploaded_at=datetime.utcnow(),
    )
    if not doc.id:
        import uuid

        doc.id = str(uuid.uuid4())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/download/{document_id}")
def get_download_url(
    document_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(404, "Not found")
    # security: ensure user owns the application
    _ensure_app(db, doc.application_id, user.id)
    url = presign_get(doc.s3_key)
    return {"url": url}


@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(404, "Not found")
    _ensure_app(db, doc.application_id, user.id)
    db.delete(doc)
    db.commit()
    # (Optional) delete from S3 here as well if you want: s3.delete_object(Bucket=..., Key=doc.s3_key)
    return {"ok": True}
