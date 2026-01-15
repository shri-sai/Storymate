from pydantic import BaseModel
from uuid import UUID
from datetime import date, time, datetime

# Mentor Schema
# Mentor schema is used when we view the list of mentors 
class MentorSchema(BaseModel):
    mentor_id : UUID
    mentor_name : str
    mentor_bio : str
    profile_picture: str

    class Config:
        from_attributes = True


#---------------------------------------#

# Session Book Schema
# This schema is used when a person books an appointment
class SessionBookSchema(BaseModel):
    mentor_id : UUID
    session_date : date
    session_time : time

    class Config:
        from_attributes = True
#---------------------------------------#


# Session Book output Schema
# This schema is used to view the booked session details
class SessionBookOutputSchema(BaseModel):
    session_id : UUID
    mentor_id : UUID
    user_id : UUID
    session_date : date
    session_time : time
    max_capacity : int
    created_at : datetime
    updated_at : datetime

    class Config:
        from_attributes = True          

#---------------------------------------#

# Session Feedback Schema
# This schema is used when a mentor gives feedback to a user for a session
class SessionFeedbackSchema(BaseModel):
    session_id : UUID
    mentor_id : UUID
    story_title : str
    feedback : str
    grade : str

    class Config:
        from_attributes = True

#---------------------------------------#


# Session Feedback output Schema
# This schema is used to view the session feedback details
class SessionFeedbackOutputSchema(BaseModel):
    feedback_id : UUID
    session_id : UUID
    mentor_id : UUID
    user_id : UUID
    story_title : str
    feedback : str
    grade : str
    created_at : datetime
    updated_at : datetime

    class Config:
        from_attributes = True