from sqlalchemy.orm import Session
from models.user import User
from schemas.auth_schema import UserCreate
from utils.security import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        password=hashed_password,
        company=user.company
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
