from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.config.models import MentorsModel,StorySessionModel,SessionFeedbackModel
from .session_models import MentorSchema,SessionBookSchema,SessionBookOutputSchema,SessionFeedbackSchema
from uuid import UUID
from datetime import date, datetime

class StorySessionService:
    """
    Service class for managing story telling session bookings
    """
    def __init__(self, db):
        self.db = db

    # View Mentors list
    def view_mentors(self):
        """
        return list of mentors and their details from MentorsModel
        - mentor name
        - mentor bio
        - mentor profile picture
        """
        mentors = self.db.query(MentorsModel).all()
        return mentors
    

    # Book a session with a mentor
    def book_session(self, data:SessionBookSchema, user_id: UUID):
        """
        Book a session with a mentor
        
        inputs:
        - mentor_id
        - session_date
        - session_time
        """

        # we check if a session already exists for the selected date and time
        existing_session = (
            self.db.query(StorySessionModel)
            .filter(
                StorySessionModel.session_date == data.session_date,
                StorySessionModel.session_time == data.session_time
                )
                .first()
                )
        if existing_session:
            return None

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


    # Mark session as complete
    def mark_session_complete(self, session_id: UUID, mentor_id: UUID):
        """
        Mark a session as complete
        inputs:
        - session_id
        - mentor_id
        """
        session = (
        self.db.query(StorySessionModel)
        .filter(
            StorySessionModel.session_id == session_id,
            StorySessionModel.mentor_id == mentor_id
        )
        .first()
        )
        if not session:
            return None
        
        # Check if the session date and time is in the past
        today = date.today()
        now_time = datetime.now().time()
        
        if (
        session.session_date > today or
        (session.session_date == today and session.session_time > now_time)
        ):
            return "Session not yet occurred"
        

        # Mark the session as complete
        session.completion_status = True
        session.updated_by = None
        self.db.commit()
        self.db.refresh(session)
        return session


    # Mentor gives feedback for a completed session
    def give_feedback(self, data: SessionFeedbackSchema, mentor_id: UUID):
        session = (
        self.db.query(StorySessionModel)
        .filter(StorySessionModel.session_id == data.session_id)
        .first()
        )
        
        if not session:
            return None
        
        if session.mentor_id != mentor_id:
            return "FORBIDDEN"
        
        new_feedback = SessionFeedbackModel(
        session_id=data.session_id,
        mentor_id=mentor_id,
        user_id=data.user_id,
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
    
    def view_upcoming_sessions(self, user_id: UUID):
        today = date.today()
        
        results = (
            self.db.query(
            StorySessionModel.session_id,
            StorySessionModel.session_date,
            StorySessionModel.session_time,
            MentorsModel.mentor_id,
            MentorsModel.mentor_name,
            MentorsModel.profile_picture
        )
        .join(MentorsModel, MentorsModel.mentor_id == StorySessionModel.mentor_id)
        .filter(
            StorySessionModel.user_id == user_id,
            StorySessionModel.completion_status == False,
            StorySessionModel.status == "booked"  
        )
        .order_by(
            StorySessionModel.session_date,
            StorySessionModel.session_time
        )
        .all()
        )
        upcoming_sessions = [
        {
            "session_id": r.session_id,
            "session_date": r.session_date,
            "session_time": r.session_time,
            "mentor_id": r.mentor_id,
            "mentor_name": r.mentor_name,
            "mentor_profile_picture": r.profile_picture,
        }
        
        for r in results
        ]
        return upcoming_sessions
    
    
    def view_past_sessions(self, user_id: UUID):
        rows = (
            self.db.query(
            StorySessionModel.session_id,
            StorySessionModel.session_date,
            StorySessionModel.session_time,
            MentorsModel.mentor_id,
            MentorsModel.mentor_name,
            MentorsModel.profile_picture.label("mentor_profile_picture"),
            SessionFeedbackModel.story_title,
            SessionFeedbackModel.feedback,
            SessionFeedbackModel.grade,
            SessionFeedbackModel.created_at,
            SessionFeedbackModel.updated_at
        )
        .join(MentorsModel, MentorsModel.mentor_id == StorySessionModel.mentor_id)
        .join(SessionFeedbackModel, SessionFeedbackModel.session_id == StorySessionModel.session_id)
        .filter(
            StorySessionModel.user_id == user_id,
            StorySessionModel.completion_status == True,
            StorySessionModel.status == "booked"
        )
        .order_by(
            StorySessionModel.session_date.desc(),
            StorySessionModel.session_time.desc()
        )
        .all()
    )
        return rows
    

    def cancel_session(self, session_id: UUID, user_id: UUID):
        session = (
        self.db.query(StorySessionModel)
        .filter(
            StorySessionModel.session_id == session_id,
            StorySessionModel.user_id == user_id,
            StorySessionModel.status == "booked",
            StorySessionModel.completion_status == False
        )
        .first()
        )
        if not session:
            return None
        session.status = "cancelled"
        session.updated_by = user_id
        self.db.commit()
        self.db.refresh(session)
        return session






    
