from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from .config import settings

ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Password hashing
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# JWT: keep the name expected by auth.py
def create_token(sub: str, minutes: int | None = None) -> str:
    exp_minutes = minutes if minutes is not None else settings.JWT_EXPIRE_MINUTES
    expire = datetime.utcnow() + timedelta(minutes=exp_minutes)
    payload = {"sub": sub, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    # Raises JWTError if invalid/expired; our deps layer will catch and 401
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
