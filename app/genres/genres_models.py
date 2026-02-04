from pydantic import BaseModel

# GENRES DROPDOWN LIST
# This schema returns the genre names in the databse
# when a user clicks on the genre button, all the names will be shown in a dropdown list
class GenresList(BaseModel):
    genre_id: int
    genre_name: str

    class Config:
        from_attributes = True


