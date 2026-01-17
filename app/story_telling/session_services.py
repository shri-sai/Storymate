from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.config.models import MentorsModel,StorySessionModel,SessionFeedbackModel
from .session_models import MentorSchema,SessionBookSchema,SessionBookOutputSchema,SessionFeedbackSchema,SessionFeedbackOutputSchema
from uuid import UUID
from datetime import date

class StorySessionService:
    """
    Service class for managing story telling session bookings
    """
    def __init__(self, db):
        self.db = db


    def view_mentors(self):
        """
        View the list of mentors
        - mentor name
        - mentor profile picture
        - mentore bio
        """
        mentors = self.db.query(MentorsModel).all()
        return mentors
    

    def book_session(self, data:SessionBookSchema, user_id: UUID):
        """
        Book a session with a mentor
        - mentor id     
        - session date
        - session time
        """
        new_session = StorySessionModel(
            user_id = user_id,
            mentor_id = data.mentor_id,
            session_date = data.session_date,
            session_time = data.session_time,
            created_by = user_id,
            updated_by = user_id
        )
        self.db.add(new_session)
        self.db.commit()
        self.db.refresh(new_session)
        return new_session
    

    def give_feedback(self, data: SessionFeedbackSchema, mentor_id: UUID):
        session = (
        self.db.query(StorySessionModel)
        .filter(StorySessionModel.session_id == data.session_id)
        .first()
    )
        if not session:
            return None
        
        if session.mentor_id != mentor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to give feedback for this session"
            )
        
        existing_feedback = (
        self.db.query(SessionFeedbackModel)
        .filter(SessionFeedbackModel.session_id == data.session_id)
        .first()
    )
        if existing_feedback:
            return {"detail": "Feedback already given for this session"}
        
        new_feedback = SessionFeedbackModel(
            session_id=data.session_id,
            mentor_id=mentor_id,
            user_id= session.user_id,
            story_title=data.story_title,                
            feedback=data.feedback,
            grade=data.grade,
            created_by=mentor_id,
            updated_by=mentor_id
            )
        self.db.add(new_feedback)
        self.db.commit()
        self.db.refresh(new_feedback)
        return new_feedback

    

    def view_feedback(self, session_id: UUID, user_id: UUID):
        return (
        self.db.query(SessionFeedbackModel)
        .filter(
            SessionFeedbackModel.session_id == session_id,
            SessionFeedbackModel.user_id == user_id
        )
        .first()
    )


    
