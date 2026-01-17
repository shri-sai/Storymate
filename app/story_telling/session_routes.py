from fastapi import APIRouter, Depends
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.config.database import get_db
from .session_models import (
    MentorSchema, 
    SessionBookSchema, 
    SessionBookOutputSchema, 
    SessionFeedbackSchema, 
    UpcomingSessionSchema, 
    PastSessionSchema)
from .session_services import StorySessionService



router = APIRouter(
    prefix="/sessions",
    tags=["Story Telling Sessions"]
)



# get route to view mentors list
@router.get("/mentors", response_model=list[MentorSchema])
def view_mentors(db: Session = Depends(get_db)):
    """
    View the list of mentors
    - mentor name
    - mentor bio
    - mentor profile picture
    """
    service = StorySessionService(db)
    return service.view_mentors()       



# post route to book a session with a mentor
@router.post("/book", 
             response_model=SessionBookOutputSchema,
             status_code=201)
def book_session(data: SessionBookSchema, user_id: UUID, db: Session = Depends(get_db)):
    """
    Book a session with a mentor
    inputs:
    - mentor_id
    - session_date
    - session_time
    """
    service = StorySessionService(db)
    result =  service.book_session(data, user_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=" A session already existsfor the selected date and time"
        )
    return result


# post route to mark a session as complete
@router.post("/complete", status_code=200)
def mark_session_complete(session_id: UUID, mentor_id: UUID, db: Session = Depends(get_db)):
    """
    Mark a session as complete by the mentor
    inputs:
    - session_id
    - mentor_id
    """
    service = StorySessionService(db)
    result = service.mark_session_complete(session_id, mentor_id)

    if result is None:
        raise HTTPException(status_code=404, detail="Session not found or mentor unauthorized")

    if result == "Session not yet occurred":
        raise HTTPException(
            status_code=400,
            detail="Cannot mark a future session as complete"
        )
    
    return {"message": "Session marked as complete"}



# post route for mentor to give feedback for a completed session
@router.post("/feedback", 
             response_model=SessionFeedbackSchema,
             status_code=201)
def give_feedback(data: SessionFeedbackSchema, mentor_id: UUID, db: Session = Depends(get_db)):
    """
    Mentor gives feedback for a completed session
    inputs:
    - session_id
    - user_id
    - story_title
    - feedback
    - grade
    """
    service = StorySessionService(db)
    result = service.give_feedback(data, mentor_id)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if result == "FORBIDDEN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to give feedback for this session"
        )
    return result



@router.get("/upcoming", response_model=list[UpcomingSessionSchema])
def view_upcoming_sessions(user_id: UUID, db: Session = Depends(get_db)):
    """ 
    View upcoming sessions for a user
     inputs:
     - user_id
    
    outputs:
    - session_id
    - mentor_id
    - session_date
    - session_time
    """

    service = StorySessionService(db)
    upcoming = service.view_upcoming_sessions(user_id)
    if not upcoming:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No upcoming sessions found"
        )
    return upcoming


@router.get("/past", response_model=list[PastSessionSchema])
def view_past_sessions(user_id: UUID, db: Session = Depends(get_db)):
    """
    View past sessions for a user
     inputs:
     - user_id
    outputs:
    - session_id
    - mentor_id
    - session_date
    - session_time
    - story_title
    - feedback
    - grade
    """
    service = StorySessionService(db)
    past = service.view_past_sessions(user_id)
    if not past:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No past sessions found"
        )
    return past   

@router.post("/cancel")
def cancel_session(session_id: UUID, user_id: UUID, db: Session = Depends(get_db)):
    service = StorySessionService(db)
    result = service.cancel_session(session_id, user_id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Session cannot be cancelled"
        )

    return {"message": "Session cancelled successfully"}
