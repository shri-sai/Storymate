
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.config.models import UsersModel
from .auth_models import UserSignupSchema, UserLoginSchema
from app.utils.password_utils import hash_password, verify_password


# USER SIGN UP

def create_user(db: Session, data: UserSignupSchema):

    # check password match
    if data.password != data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # check if email already exists
    existing_user = db.query(UsersModel).filter(UsersModel.email_id == data.email_id).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    

    new_user = UsersModel(
        email_id=data.email_id,
        user_name=data.user_name,
        password=hash_password(data.password)
        )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# USER LOGIN



def login_user(db: Session, data: UserLoginSchema):
    # find user by email
    user = db.query(UsersModel).filter(UsersModel.email_id == data.email_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # verify password
    if not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    return user