from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from .auth_models import UserSignupSchema, UserLoginSchema, UserResponseSchema
from .auth_services import create_user, login_user

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post("/signup", response_model=UserResponseSchema)
def signup(data: UserSignupSchema, db: Session = Depends(get_db)):
    return create_user(db, data)

@router.post("/login", response_model=UserResponseSchema)
def login(data: UserLoginSchema, db: Session = Depends(get_db)):
    return login_user(db, data)
