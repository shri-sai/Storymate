from pydantic import BaseModel, EmailStr
from uuid import UUID

# SIGN UP SCHEMA
# this schema is used when someone crates a new account
class UserSignupSchema(BaseModel):
    email_id: EmailStr
    user_name: str
    password: str 
    confirm_password: str  # for now plain string, later we’ll hash

    class Config:
        from_attributes = True

#---------------------------------------------------------------#

#LOGIN SCHEMA
# the following schemas are used when a user tries to login back into their account
class UserLoginSchema(BaseModel):
    email_id: EmailStr
    password: str

class UserResponseSchema(BaseModel):
    user_id: UUID
    email_id: EmailStr
    user_name: str

    class Config:
        from_attributes = True
