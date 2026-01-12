from fastapi import FastAPI


app = FastAPI()


from app.auth.auth_routes import router as auth_router
app.include_router(auth_router)
