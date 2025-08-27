---

## Node.js in This Project

Node.js is used **only** for the React Native (Expo) mobile app development workflow:
- Running the Expo/React Native development server and build tools
- Managing frontend dependencies via `npm` and `package.json`
- Running scripts for starting the app, backend, or both in development

**All backend logic, APIs, and AI integration are handled by Python (FastAPI). Node.js does not serve as a backend server in this project.**

---
---

## AI Model Integration (Llama/Ollama/Mistral)

This project uses a real LLM (Large Language Model) for chatbot responses, running locally via [Ollama](https://ollama.com/) or compatible APIs.

### Supported Models
- **Llama 2** (default, fast and CPU-friendly)
- **Mistral** (optional, for more advanced responses)

### How It Works
- The backend (`Backend/controllers/chat.py`) sends user prompts to the local Ollama server (default: `http://localhost:11434/api/generate`).
- The model generates a response, which is returned to the mobile app.
- The knowledge base (`Backend/knowledge.txt`) is used to provide context for hotel-specific questions.

### Model Setup Instructions
1. **Install Ollama** ([see official instructions](https://ollama.com/download))
2. **Download a model** (e.g., Llama 2):
	```bash
	ollama pull llama2
	# or for Mistral:
	ollama pull mistral
	```
3. **Start the Ollama server** (usually starts automatically):
	```bash
	ollama serve
	```
4. **Test the model**:
	```bash
	ollama run llama2
	```
5. **Ensure the backend can reach Ollama at `http://localhost:11434`**

**Note:** You can change the model or Ollama endpoint in `Backend/controllers/chat.py`.

---

## Authentication System & Token Refresh

The application uses JWT (JSON Web Token) authentication with access tokens (30-minute expiry) and refresh tokens (7-day expiry).

### Current Implementation
- Access tokens expire after 30 minutes (configured in `Backend/config/jwt_config.py`)
- Refresh tokens are generated but not automatically used
- Users need to sign in again after token expiration

### Future Improvements
- **Implement Token Refresh Functionality**:
  - Add a token refresh endpoint in `Backend/routes/auth_routes.py`
  - Create middleware to detect expired tokens and use refresh tokens
  - Update frontend authentication service to handle token refresh
  - Implement automatic re-authentication when tokens expire

### Implementation Steps
1. Add a refresh token endpoint to the backend:
   ```python
   @router.post("/refresh")
   def refresh_token(request: Request, db: Session = Depends(get_db)):
       # Get refresh token from Authorization header
       auth_header = request.headers.get("Authorization")
       if not auth_header or not auth_header.startswith("Bearer "):
           raise HTTPException(status_code=401, detail="Invalid token")
       
       refresh_token = auth_header.split(" ")[1]
       # Verify refresh token and generate new access token
       try:
           payload = verify_token(refresh_token, token_type="refresh")
           user_id = payload.get("sub")
           # Generate new access token
           new_access_token = create_access_token({"sub": user_id})
           return {"access_token": new_access_token}
       except Exception as e:
           raise HTTPException(status_code=401, detail="Invalid refresh token")
   ```

2. Update the frontend authentication service to handle token refresh:
   ```javascript
   // In src/services/authService.js
   static async refreshToken() {
     const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
     if (!refreshToken) {
       throw new Error('No refresh token available');
     }
     
     const response = await fetch(getApiUrl('/api/auth/refresh'), {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${refreshToken}`,
         'Content-Type': 'application/json',
       }
     });
     
     if (!response.ok) {
       throw new Error('Failed to refresh token');
     }
     
     const data = await response.json();
     await AsyncStorage.setItem(TOKEN_KEY, data.access_token);
     return data.access_token;
   }
   ```

3. Add an interceptor for API calls to handle token expiration:
   ```javascript
   // In a new src/services/apiInterceptor.js file
   export const authenticatedFetch = async (url, options = {}) => {
     try {
       // Try with existing token
       const token = await AuthService.getToken();
       const response = await fetch(url, {
         ...options,
         headers: {
           ...options.headers,
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json',
         },
       });
       
       if (response.status === 401) {
         // Token expired, try to refresh
         const newToken = await AuthService.refreshToken();
         // Retry with new token
         return fetch(url, {
           ...options,
           headers: {
             ...options.headers,
             'Authorization': `Bearer ${newToken}`,
             'Content-Type': 'application/json',
           },
         });
       }
       
       return response;
     } catch (error) {
       // If refresh fails, redirect to login
       throw error;
     }
   };
   ```

---

# Fairmont Mobile & Backend Platform

An advanced mobile and backend platform for Fairmont Hotels, featuring:
- A modern React Native app (Expo) for guests and Heartists (employees)
- A FastAPI Python backend with AI chatbot, multi-session chat, and admin dashboard
- Personalized Heartist dashboard, admin data entry, and secure authentication

---

## Features

- **AI Chatbot**: Real hotel assistant powered by Llama/Ollama models and a local knowledge base
- **Heartist Dashboard**: Personalized dashboard for employees, with tasks, events, and meetings
- **Admin Dashboard**: Web UI for admins to add/manage employee data and monitor activity
- **Multi-session Chat**: Per-user chat history, session management, and protected chat UI
- **Modern UI/UX**: Beautiful, branded, and responsive design for both guests and Heartists
- **Secure Auth**: JWT authentication, protected routes, and role-based access
- **Cross-platform**: Works on iOS, Android, and web (Expo)

---

## Project Structure

```
fairmont-mobile/
├── app/                    # React Native app screens (chatbot, Heartist dashboard, profile, etc.)
├── src/services/           # API service modules
├── assets/                 # Images, icons, and branding
├── Backend/                # FastAPI backend (Python)
│   ├── main.py             # FastAPI entrypoint
│   ├── routes/             # API route modules
│   ├── controllers/        # Business logic (AI, chat, etc.)
│   ├── models/             # SQLAlchemy models (User, Task, etc.)
│   ├── static/             # Admin dashboard HTML/CSS/JS
│   ├── knowledge.txt       # AI knowledge base
│   └── ...
└── package.json            # Frontend dependencies/scripts
```

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python 3.11+
- Expo CLI (`npm install -g expo-cli`)
- (Optional) Android Studio/iOS Simulator for device testing

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend (Python)
cd Backend
pip install -r requirements.txt
cd ..
```

### 2. Configure Environment

- Edit `src/config.js` to set your backend API base URL (LAN IP for device testing)
- Backend runs on port 8080 by default (see `Backend/main.py`)

### 3. Run the Backend

```bash
cd Backend
python main.py
# Or use: uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

### 4. Run the Mobile App

```bash
# In project root
npm start
# Or: expo start
```

---

## Usage

- **Chatbot**: Guests and Heartists can chat with the AI assistant (multi-session, history, real LLM responses)
- **Heartist Dashboard**: Employees see personalized tasks, events, and meetings
- **Profile**: View user info, activity, and admin monitoring
- **Admin Dashboard**: Visit `/admin` in browser to add/manage tasks, events, meetings for Heartists

---

## Backend API (FastAPI)

- `POST /api/auth/signin` - User login
- `GET /api/session/list` - List chat sessions
- `POST /api/session/new` - Create new chat session
- `POST /api/chat/message` - Send message to AI
- `GET/POST /api/employee/tasks` - Get/add tasks (admin only for POST)
- `GET/POST /api/employee/events` - Get/add events (admin only for POST)
- `GET/POST /api/employee/meetings` - Get/add meetings (admin only for POST)

See `Backend/routes/` for full API details.

---

## Customization & Development

- **Frontend**: Edit screens in `app/`, services in `src/services/`, and config in `src/config.js`
- **Backend**: Edit API logic in `Backend/routes/`, models in `Backend/models/`, and AI logic in `Backend/controllers/chat.py`
- **Knowledge Base**: Update `Backend/knowledge.txt` to improve AI answers

---

## Contributing

1. Fork the repo and create a feature branch
2. Make your changes and test thoroughly
3. Submit a pull request with a clear description

---

## License

This project is proprietary to Fairmont Hotels. All rights reserved.

---

## Support

For technical support, contact the development team or open an issue.