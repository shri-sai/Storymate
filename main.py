from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],  # allow everything during dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")


from app.auth.auth_routes import router as auth_router
app.include_router(auth_router)

from app.story_telling.session_routes import router as session_router
app.include_router(session_router)

from app.genres.genres_routes import router as genres_router
app.include_router(genres_router)