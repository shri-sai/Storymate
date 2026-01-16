from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.config.models import MentorsModel,StorySessionModel,SessionFeedbackModel
from .session_models import MentorSchema,SessionBookSchema,SessionBookOutputSchema,SessionFeedbackSchema,SessionFeedbackOutputSchema


class booksession:
    """
    Service class for managing story telling session bookings
    """
    #defining the database and 
    class StorySessionService:
        def __init__(self, db):
            self.db = db


    def view_mentors(self, db = Session):
        """
        View the list of mentors
        - mentor name
        - mentor profile picture
        - mentore bio
        """

        mentors = db.query(MentorsModel).all()
        return mentors
    
    def book_session(self, data:SessionBookSchema, db = Session):
        """
        Book a session with a mentor
        - mentor id     
        - session date
        - session time
        """
        new_session = StorySessionModel(
            mentor_id = data.mentor_id,
            session_date = data.session_date,
            session_time = data.session_time
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        return new_session
    
    def give_feedback(self, data:SessionFeedbackSchema, db = Session):
        """
        Docstring for give_feedback
        
        :param self: Description
        :param data: Description
        :type data: SessionFeedbackSchema
        :param db: Description
        """
        new_feedback = SessionFeedbackModel(
            session_id = data.session_id,
            mentor_id = data.mentor_id,
            story_title = data.story_title,
            feedback = data.feedback,
            grade = data.grade
        )
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)
        return new_feedback
    
    def view_feedback(self, session_id: str, db = Session):
        """
        View feedback for a session
        - session id
        """
        feedback = db.query(SessionFeedbackModel).filter(SessionFeedbackModel.session_id == session_id).first()
        if not feedback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feedback not found for the given session id"
            )
        return feedback