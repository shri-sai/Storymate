from sqlalchemy.orm import Session
from app.config.models import GenresModel
from app.genres.genres_models import GenresList

# GENRES LIST

#service to view the list of genres
def view_genres_list(db: Session):
    """Dropdown: list of all genres"""
    genres = db.query(GenresModel.genre_id, GenresModel.genre_name).all()
    return [
        GenresList(
            genre_id=g[0],
            genre_name=g[1]
        )
        for g in genres
    ]
