from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from pytz import timezone
from models import init_db
from fastapi import Depends
from models import Feedback as FeedbackTable
from models import SessionLocal, User

# Set IST timezone
IST = timezone("Asia/Kolkata")

class LoginRequest(BaseModel):
    email: str
    password: str


app = FastAPI()
init_db()

def get_current_user(username: str):
    db = SessionLocal()
    print(f"🔍 Authenticating: {username}")
    user = db.query(User).filter(User.email == username).first()
    print(f"User found: {user.email if user else 'None'}")
    db.close()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "manager_id": user.manager_id,
    }

@app.on_event("startup")
def list_users():
    db = SessionLocal()
    print("🔐 Users in DB:")
    for user in db.query(User).all():
        print(f"- {user.role}: {user.email}")
    db.close()

@app.get("/team")
def get_team(username: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view their team")

    db = SessionLocal()
    team_members = db.query(User).filter(User.manager_id == current_user["id"]).all()
    db.close()

    return [
        {
            "id": member.id,
            "name": member.name,
            "email": member.email
        } for member in team_members
    ]

# Allow requests from our React app
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class FeedbackBase(BaseModel):
    employee_id: str
    strengths: str
    areas_to_improve: str
    overall_sentiment: str

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackUpdate(BaseModel):
    strengths: Optional[str]
    areas_to_improve: Optional[str]
    overall_sentiment: Optional[str]

class Feedback(BaseModel):
    id: str
    employee_email: str
    manager_email: str
    strengths: str
    areas_to_improve: str
    overall_sentiment: str
    created_at: datetime
    updated_at: datetime
    acknowledged: bool

    class Config:
        orm_mode = True

@app.post("/login")
def login_user(credentials: LoginRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.email == credentials.email).first()
    db.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # For demo: password check is fake (plain match)
    if user.role == "manager" and credentials.password == "Manager123":
        return {"role": "manager", "email": user.email}
    elif user.role == "employee" and credentials.password in ["Employee1", "Employee2", "Employee3"]:

        return {"role": "employee", "email": user.email}
    
    raise HTTPException(status_code=401, detail="Invalid credentials")


# Create feedback
@app.post("/feedback", response_model=Feedback)
def create_feedback(feedback: FeedbackCreate, username: str, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        print("💡 Request received:", feedback.dict())
        employee = db.query(User).filter(User.email == feedback.employee_id).first()

        if not employee or employee.manager_id != current_user["id"]:
            raise HTTPException(status_code=403, detail="Employee not in your team")

        fb = FeedbackTable(
            id=str(uuid.uuid4()),
            employee_email=feedback.employee_id,
            manager_email=current_user["email"],
            strengths=feedback.strengths,
            areas_to_improve=feedback.areas_to_improve,
            overall_sentiment=feedback.overall_sentiment,
            created_at=datetime.now(IST),
            updated_at=datetime.now(IST),
            acknowledged=False
        )

        db.add(fb)
        db.commit()
        db.refresh(fb)
        print("✅ Saved feedback:", fb.__dict__)
        return fb

    except Exception as e:
        import traceback
        print("Error creating feedback:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")

    finally:
        db.close()

# Get feedback
@app.get("/feedback", response_model=List[Feedback])
def get_feedbacks(manager: str, employee: str):
    db = SessionLocal()
    query = db.query(FeedbackTable)

    if manager != "all":
        query = query.filter(FeedbackTable.manager_email == manager)

    query = query.filter(FeedbackTable.employee_email == employee)

    feedbacks = query.order_by(FeedbackTable.created_at.desc()).all()
    db.close()
    return feedbacks

# Update feedback
@app.put("/feedback/{feedback_id}", response_model=Feedback)
def update_feedback(feedback_id: str, feedback_update: FeedbackUpdate, username: str, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        fb = db.query(FeedbackTable).filter(FeedbackTable.id == feedback_id).first()
        if not fb:
            raise HTTPException(status_code=404, detail="Feedback not found")
        if fb.manager_email != current_user["email"]:
            raise HTTPException(status_code=403, detail="You do not have permission to update this feedback")

        if feedback_update.strengths is not None:
            fb.strengths = feedback_update.strengths
        if feedback_update.areas_to_improve is not None:
            fb.areas_to_improve = feedback_update.areas_to_improve
        if feedback_update.overall_sentiment is not None:
            fb.overall_sentiment = feedback_update.overall_sentiment

        fb.updated_at = datetime.now(IST)
        db.commit()
        db.refresh(fb)
        return fb
    finally:
        db.close()

# Acknowledge feedback
@app.post("/feedback/{feedback_id}/acknowledge")
def acknowledge_feedback(feedback_id: str, username: str, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        fb = db.query(FeedbackTable).filter(
            FeedbackTable.id == feedback_id,
            FeedbackTable.employee_email == current_user["email"]
        ).first()
        if not fb:
            raise HTTPException(status_code=404, detail="Feedback not found or not associated with the user")

        fb.acknowledged = True
        fb.updated_at = datetime.now(IST)
        db.commit()
        return {"message": "Feedback acknowledged"}
    finally:
        db.close()