from app.config.database import Base
from sqlalchemy import Column, Float, Integer, Boolean, String, Enum, DateTime, ForeignKey, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func



# USERS TABLE
class UsersModel(Base):
    __tablename__ = "users"
    user_id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        index=True, 
        server_default=text("uuid_generate_v4()")
    )
    email_id = Column(String, unique=True, nullable=False, index=True)
    user_name = Column(String, nullable=False)
    password = Column(String, nullable=False)  # plain for now


# STORY TABLE
class StoryModel(Base):
    __tablename__ = "stories"
    story_id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        index=True, 
        server_default=text("uuid_generate_v4()")
    )
    title = Column(String)
    author_name = Column(String)
    content = Column(Text)
    estimated_read_time = Column(Integer)
    blurb = Column(Text)
    rating = Column(Float)
    image_url = Column(String)
    genre_id = genre_id = Column(Integer, ForeignKey("genres.genre_id"), nullable=False, index=True)


# COMPLETION STATUS TABLE
class StoryCompletionModel(Base):
    __tablename__ = "completion_status"
    id = Column(Integer,primary_key = True, index = True )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False, index=True)
    story_id = Column(UUID(as_uuid=True), ForeignKey("stories.story_id"), nullable=False, index=True)
    status = Column(Enum("in progress","completed", name="status", create_type=False), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), index=True)


# FEEDBACK TABLE
class FeedbackModel(Base):
    __tablename__ = "feedback"
    feedback_id = Column(Integer,primary_key = True, index = True )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False, index=True)
    story_id = Column(UUID(as_uuid=True), ForeignKey("stories.story_id"), nullable=False, index=True)
    reaction = Column(Enum("like", "love", "dislike", "report", name="reaction_type", create_type=False), nullable=False, index=True)
    reason = Column (String, index = True)
    comment = Column (String, index = True)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), index=True)


# READING LIST NAMES TABLE
class ReadingList(Base):
    __tablename__ = "reading_lists"
    reading_list_id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        index=True, 
        server_default=text("uuid_generate_v4()")
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False, index=True)
    reading_list_name = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), index=True)


# STORIES IN READING LIST
class ReadingListStory(Base):
    __tablename__ = "reading_list_stories"
    id = Column(Integer, primary_key=True, index=True)
    reading_list_id = Column(UUID(as_uuid=True), ForeignKey("reading_lists.reading_list_id"), nullable=False, index=True)
    story_id = Column(UUID(as_uuid=True), ForeignKey("stories.story_id"), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), index=True)
    is_active = Column(Boolean, default=True)
    removed_at = Column(DateTime, nullable=True)


# GENRES TABLE
class GenresModel(Base):
    __tablename__ = "genres"
    genre_id = Column(Integer, primary_key = True, index= True)
    genre_name = Column(String)


# VIDEOS TABLE
class VideosModel(Base):
    __tablename__ = 'videos'
    video_id = Column(UUID(as_uuid = True), primary_key = True)
    title = Column(String, nullable = False, index = True)
    thumbnail_url = Column(String,nullable = False, index = True )
    video_url = Column(String,nullable = False, index = True)
    blurb = Column(String,nullable = False, index = True)
    duration = Column(String,nullable = False, index = True)
    video_type = Column(Enum('long','short', name = 'video'), nullable = False, index = True)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), index=True)

