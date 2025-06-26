import datetime
from sqlalchemy import create_engine, Column, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Define the database URL - the SQLite database will be a file named feedback.db in your backend folder
DATABASE_URL = "sqlite:///./feedback.db"

# Create the engine with a special flag for SQLite
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our classes definitions
Base = declarative_base()

# User model: represents users (managers and employees)
class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True, index=True)  # Use a string (UUID) for unique ID
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # Either 'manager' or 'employee'
    manager_id = Column(String, ForeignKey('users.id'), nullable=True)  # For employees, this field stores the manager's id

# Feedback model: represents the feedback entries
class Feedback(Base):  # ✅ proper SQLAlchemy base
    __tablename__ = 'feedback'

    id = Column(String, primary_key=True, index=True)
    employee_email = Column(String, nullable=False)
    manager_email = Column(String, nullable=False)
    strengths = Column(Text, nullable=False)
    areas_to_improve = Column(Text, nullable=False)
    overall_sentiment = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    acknowledged = Column(Boolean, default=False)

# Utility function to initialize the database and create tables
def init_db():
    Base.metadata.create_all(bind=engine)