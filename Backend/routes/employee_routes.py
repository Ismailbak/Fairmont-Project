## PATCH endpoints moved below router and response model definitions
from fastapi import HTTPException
from sqlalchemy.exc import NoResultFound

# --- PATCH: Mark task as done ---

# (Move these endpoints after router and response model definitions)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from config.database import get_db
from middleware.auth_middleware import get_current_active_user
from models.user import User
from models.employee_data import Task, Event, Meeting

router = APIRouter(prefix="/api/employee", tags=["Employee"])

# Pydantic response models
class TaskResponse(BaseModel):
    id: int
    title: str
    due: str = None
    description: str | None = None
    created_at: datetime
    class Config:
        from_attributes = True

class EventResponse(BaseModel):
    id: int
    title: str
    date: str = None
    description: str | None = None
    created_at: datetime
    class Config:
        from_attributes = True

class MeetingResponse(BaseModel):
    id: int
    title: str
    time: str = None
    description: str | None = None
    created_at: datetime
    class Config:
        from_attributes = True

# --- PATCH: Mark task as done ---
@router.patch("/tasks/{task_id}/done", response_model=TaskResponse)
def mark_task_done(task_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.completed = 1
    db.commit()
    db.refresh(task)
    return task

# --- PATCH: RSVP to event ---
@router.patch("/events/{event_id}/rsvp", response_model=EventResponse)
def rsvp_event(event_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.rsvped = 1
    db.commit()
    db.refresh(event)
    return event

# --- PATCH: RSVP to meeting ---
@router.patch("/meetings/{meeting_id}/rsvp", response_model=MeetingResponse)
def rsvp_meeting(meeting_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting.rsvped = 1
    db.commit()
    db.refresh(meeting)
    return meeting

@router.get("/tasks", response_model=List[TaskResponse])
def get_tasks(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.user_id == current_user.id).all()

@router.get("/events", response_model=List[EventResponse])
def get_events(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return db.query(Event).all()

@router.get("/meetings", response_model=List[MeetingResponse])
def get_meetings(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return db.query(Meeting).all()

# Admin endpoints for adding data (to be used by admin dashboard)
class TaskCreate(BaseModel):
    user_id: int
    title: str
    due: str = None
    description: str = None

@router.post("/tasks", response_model=TaskResponse)
def create_task(task: TaskCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

class EventCreate(BaseModel):
    title: str
    date: str = None
    description: str = None

@router.post("/events", response_model=EventResponse)
def create_event(event: EventCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    db_event = Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

class MeetingCreate(BaseModel):
    title: str
    time: str = None
    description: str = None

@router.post("/meetings", response_model=MeetingResponse)
def create_meeting(meeting: MeetingCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    db_meeting = Meeting(**meeting.dict())
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting
