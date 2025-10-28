from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import uuid
from ..schemas import UserCreate, TokenOut
from ..models import User
from ..security import hash_password, verify_password, create_token
from ..deps import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        name=data.name,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    tok = create_token(user.id)
    return {"access_token": tok, "user": user}


@router.post("/login", response_model=TokenOut)
def login(data: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(400, "Invalid credentials")
    tok = create_token(user.id)
    return {"access_token": tok, "user": user}


@router.get("/test-token")
def test_token(user: User = Depends(get_current_user)):
    return {"ok": True, "user": {"id": user.id, "email": user.email, "name": user.name}}
