# Importing the tools we need from SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# This is the URL to connect to the PostgreSQL database
# Format : "postgresql://<username>:<password>@<host>:<port>/<database_name>"
database_url = "postgresql://postgres:admin123@localhost/StoryMate"


# we create an engine using the URL which will communicate to the database 
engine = create_engine(database_url)


# we create a session - this will help us open and manage the DB connections
# autocommit=False means changes only save when we tell it to
# autoflush=False means we manually control when data is sent to the DB
# bind = engine tells which database connection we are using

SessionLocal = sessionmaker(autocommit = False, autoflush= False, bind = engine )

# we create a base class for all tables
# all our table classes(in models.py) will inherit from this
Base = declarative_base()

# fastapi will access the following function when a route needs to access the db
def get_db():
    ''' 
    creates a databse engine for each request
    '''

    db = SessionLocal() # open a new session
    try:
        yield db # give access to the function that called this
    finally:
        db.close() # close the session after it is used

