from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import requests
from sqlalchemy.orm import Session
import os
import sys
from datetime import datetime

from routes.auth_routes import router as auth_router
from routes.admin_routes import router as admin_router
from middleware.auth_middleware import get_current_active_user
from models.user import User
from controllers.auth import log_user_activity
from config.database import get_db, init_db
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from retriever import get_context

# Initialize FastAPI app
app = FastAPI(
    title="Fairmont Admin Dashboard API",
    description="API for Fairmont Hotel Admin Dashboard",
    version="1.0.0"
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        raise

# Mount static files
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
print(f"Serving static files from: {static_dir}")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
else:
    print(f"⚠️  Static directory not found: {static_dir}")

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

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Fairmont Admin Dashboard API is running"}

# Serve admin dashboard
@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard():
    """Serve the admin dashboard HTML"""
    try:
        dashboard_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "admin_dashboard.html")
        if not os.path.exists(dashboard_path):
            return HTMLResponse(
                content="<h1>Admin Dashboard Not Found</h1><p>The admin dashboard file is missing.</p>", 
                status_code=404
            )
        
        with open(dashboard_path, "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content, status_code=200)
    except Exception as e:
        return HTMLResponse(
            content=f"<h1>Error Loading Admin Dashboard</h1><p>Error: {str(e)}</p>", 
            status_code=500
        )

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
    """Chat endpoint with LLM integration"""
    try:
        user_message = req.message
        
        # Validate input
        if not user_message or len(user_message.strip()) == 0:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if len(user_message) > 1000:
            raise HTTPException(status_code=400, detail="Message too long (max 1000 characters)")
        
        context = get_context(user_message)

        # Log chat activity
        log_user_activity(
            current_user.id, 
            "chat", 
            db, 
            request, 
            f"Message: {user_message[:100]}..."
        )

        # Prepare payload for Ollama
        payload = {
            "model": "mistral",  # Or any other model served by Ollama
            "prompt": f"### Hotel Knowledge:\n{context}\n\n### Question:\n{user_message}\n\n### Answer:",
            "stream": False
        }

        # Make request to Ollama
        try:
            response = requests.post(
                "http://localhost:11434/api/generate", 
                json=payload,
                timeout=30  # 30 second timeout
            )
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.Timeout:
            raise HTTPException(status_code=504, detail="LLM request timed out")
        except requests.exceptions.ConnectionError:
            raise HTTPException(status_code=503, detail="LLM service unavailable")
        except requests.RequestException as req_err:
            raise HTTPException(status_code=502, detail=f"LLM request failed: {str(req_err)}")

        return {
            "success": True,
            "response": data.get("response", "No response from model."),
            "user": current_user.full_name,
            "timestamp": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as err:
        print(f"Unexpected error in chat endpoint: {err}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Fairmont Admin Dashboard API",
        "version": "1.0.0",
        "endpoints": {
            "admin_dashboard": "/admin",
            "health_check": "/health",
            "api_docs": "/docs",
            "chat": "/chat"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Fairmont Admin Dashboard...")
    print("📍 Admin Dashboard: http://localhost:8001/admin")
    print("📚 API Documentation: http://localhost:8001/docs")
    print("🔍 Health Check: http://localhost:8001/health")
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
