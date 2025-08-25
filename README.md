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