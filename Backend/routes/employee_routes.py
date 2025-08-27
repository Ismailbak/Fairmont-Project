## PATCH endpoints moved below router and response model definitions
from fastapi import HTTPException
from sqlalchemy.exc import NoResultFound

# --- PATCH: Mark task as done ---

# (Move these endpoints after router and response model definitions)
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from config.database import get_db
from middleware.auth_middleware import get_current_active_user
from models.user import User
from utils.email_utils import send_task_approval_email
from utils.email_utils import send_task_confirmation_email
from models.employee_data import Task, Event, Meeting

router = APIRouter(prefix="/api/employee", tags=["Employee"])

# Pydantic response models
class TaskResponse(BaseModel):
    id: int
    title: str
    due: str = None
    description: str | None = None
    created_at: datetime
    completed: int
    pending_approval: int
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
def mark_task_done(task_id: int, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    # Instead of marking as completed, set a pending_approval flag (add if not exists)
    if not hasattr(task, 'pending_approval'):
        # Add attribute dynamically for now; in real migration, add to model
        setattr(task, 'pending_approval', 1)
    else:
        task.pending_approval = 1
    db.commit()
    db.refresh(task)
    # Send approval email to admin
    background_tasks.add_task(send_task_approval_email, task.title, current_user.full_name or current_user.email, task.id)
    return task

# --- Admin Approve/Decline Task ---


@router.get("/admin/approve_task/{task_id}")
def approve_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return Response("", media_type="text/html")
    task.completed = 1
    if hasattr(task, 'pending_approval'):
        task.pending_approval = 0
    db.commit()
    send_task_confirmation_email(task.title, approved=True)
    return Response("", media_type="text/html")


@router.get("/admin/decline_task/{task_id}")
def decline_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return Response("", media_type="text/html")
    if hasattr(task, 'pending_approval'):
        task.pending_approval = 0
    db.commit()
    send_task_confirmation_email(task.title, approved=False)
    return Response("", media_type="text/html")

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
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    # Ensure completed and pending_approval are included in the response
    return [
        TaskResponse(
            id=t.id,
            title=t.title,
            due=t.due,
            description=t.description,
            created_at=t.created_at,
            completed=t.completed,
            pending_approval=t.pending_approval
        ) for t in tasks
    ]

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
