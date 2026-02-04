from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.genres.genres_services import view_genres_list
from app.genres.genres_models import GenresList


router = APIRouter(prefix="/genre", tags=["Genres"])


@router.get("/list", response_model=list[GenresList])
def get_genres_list(db: Session = Depends(get_db)):
    return view_genres_list(db)