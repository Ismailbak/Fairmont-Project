# Run Uvicorn server if executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
        log_level="debug"
    )
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import requests
from sqlalchemy.orm import Session
import os

from routes.auth_routes import router as auth_router
from routes.admin_routes import router as admin_router
from routes.chat_routes import router as chat_router
from routes.session_routes import router as session_router
from routes.employee_routes import router as employee_router
from middleware.auth_middleware import get_current_active_user
from models.user import User
from controllers.auth import log_user_activity
from config.database import get_db

# Ensure project root is in sys.path for retriever import
import sys
import os
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
from retriever import get_context

app = FastAPI()

# Mount static files
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
print(f"Serving static files from: {static_dir}")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# CORS setup (⭐ Restrict origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(chat_router)
app.include_router(session_router)
app.include_router(employee_router)

# Serve admin dashboard
@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard():
    try:
        with open("admin_dashboard.html", "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content, status_code=200)
    except Exception as e:
        return HTMLResponse(content=f"Error loading admin dashboard: {str(e)}", status_code=500)

# Pydantic model for chat
class ChatRequest(BaseModel):
    message: str

# Protected chat endpoint using local LLM via Ollama
@app.post("/chat")
async def chat_endpoint(
    req: ChatRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        user_message = req.message
        context = get_context(user_message)

        # Log chat activity
        log_user_activity(
            current_user.id, 
            "chat", 
            db, 
            request, 
            f"Message: {user_message[:100]}..."
        )

        payload = {
            "model": "mistral",  # Or any other model served by Ollama
            "prompt": f"### Hotel Knowledge:\n{context}\n\n### Question:\n{user_message}\n\n### Answer:",
            "stream": False
        }

        response = requests.post("http://localhost:11434/api/generate", json=payload)
        response.raise_for_status()  # Raise if HTTP error
        data = response.json()

        return {
            "success": True,
            "response": data.get("response", "No response from model."),
            "user": current_user.full_name
        }

    except requests.RequestException as req_err:
        raise HTTPException(status_code=502, detail=f"LLM request failed: {str(req_err)}")

    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(err)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
