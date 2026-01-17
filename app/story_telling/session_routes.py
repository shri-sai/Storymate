from fastapi import APIRouter, Depends
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.config.database import get_db
from .session_models import MentorSchema, SessionBookSchema, SessionBookOutputSchema, SessionFeedbackSchema, SessionFeedbackOutputSchema
from .session_services import StorySessionService

router = APIRouter(
    prefix="/sessions",
    tags=["Story Telling Sessions"]
)

@router.get("/mentors", response_model=list[MentorSchema])
def view_mentors(db: Session = Depends(get_db)):
    service = StorySessionService(db)
    return service.view_mentors()       


@router.post("/book", 
             response_model=SessionBookOutputSchema,
             status_code=201)
def book_session(data: SessionBookSchema, user_id: UUID, db: Session = Depends(get_db)):
    service = StorySessionService(db)
    return service.book_session(data, user_id)


@router.post("/feedback", 
             response_model=SessionFeedbackOutputSchema,
             status_code=201)
def give_feedback(data: SessionFeedbackSchema, mentor_id: UUID, db: Session = Depends(get_db)):
    service = StorySessionService(db)
    result = service.give_feedback(data, mentor_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    return result


@router.get("/feedback/{session_id}", response_model=SessionFeedbackOutputSchema)
def view_feedback(session_id: UUID, user_id: UUID, db: Session = Depends(get_db)):
    service = StorySessionService(db)
    result = service.view_feedback(session_id, user_id=user_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found"
        )   
    
    return result

