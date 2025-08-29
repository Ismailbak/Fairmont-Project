
**Prerequisites:** Node.js (v16+), Python 3.11+, Expo CLI

1. Install dependencies:
  ```bash
  npm install
  cd Backend && pip install -r requirements.txt && cd ..
  ```
2. Configure `src/config.js` (API base URL)
3. Run backend:
  ```bash
  cd Backend
  python main.py
  # or: uvicorn main:app --reload --host 0.0.0.0 --port 8080
  ```
4. Run mobile app:
  ```bash
  npm start
  # or: expo start
  ```

---

## Usage

- Chatbot: Multi-session, LLM-powered
- Heartist Dashboard: Tasks, events, meetings
- Admin Dashboard: `/admin` for managing data

---

## AI Model Integration

1. Install Ollama ([instructions](https://ollama.com/download))
2. Download a model:
  ```bash
  ollama pull llama2
  # or: ollama pull mistral
  ```
3. Start Ollama server: `ollama serve`
4. Backend connects to Ollama at `http://localhost:11434`

---

## Authentication

- JWT-based, 30-min access tokens, 7-day refresh tokens
- See `Backend/config/jwt_config.py` for config

---

## API Endpoints (see `Backend/routes/`)

- `/api/auth/signin` (POST)
- `/api/session/list` (GET)
- `/api/session/new` (POST)
- `/api/chat/message` (POST)
- `/api/employee/tasks` (GET/POST)
- `/api/employee/events` (GET/POST)
- `/api/employee/meetings` (GET/POST)

---

## Customization

- Frontend: `app/`, `src/services/`, `src/config.js`
- Backend: `Backend/routes/`, `Backend/models/`, `Backend/controllers/chat.py`
- Knowledge: `Backend/knowledge.txt`

---

# Fairmont Mobile & Backend Platform

An advanced mobile and backend platform for Fairmont Hotels, featuring:
- A modern React Native app (Expo) for guests and Heartists (employees)
- A FastAPI Python backend with AI chatbot, multi-session chat, and admin dashboard
- Personalized Heartist dashboard, admin data entry, and secure authentication

## Customization & Development

- **Frontend**: Edit screens in `app/`, services in `src/services/`, and config in `src/config.js`
- **Backend**: Edit API logic in `Backend/routes/`, models in `Backend/models/`, and AI logic in `Backend/controllers/chat.py`
- **Knowledge Base**: Update `Backend/knowledge.txt` to improve AI answers

---

## Contributing

1. Fork the repo and create a feature branch
2. Make your changes and test thoroughly
3. Submit a pull request with a clear description

# Fairmont Mobile & Backend Platform

An advanced mobile and backend platform for Fairmont Hotels, featuring:
- React Native app (Expo) for guests and Heartists (employees)
- FastAPI Python backend with AI chatbot, multi-session chat, and admin dashboard
- Personalized Heartist dashboard, admin data entry, and secure authentication

---

## Features

- AI Chatbot (Llama/Ollama/Mistral)
- Heartist & Admin Dashboards
- Multi-session chat, protected routes, role-based access
- Cross-platform (iOS, Android, Web)

---

## Project Structure

```
fairmont-mobile/
├── app/            # React Native screens
├── src/services/   # API modules
├── assets/         # Images, icons
├── Backend/        # FastAPI backend
│   ├── main.py
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── static/
│   ├── knowledge.txt
│   └── ...
└── package.json
```

---

## Getting Started

**Prerequisites:** Node.js (v16+), Python 3.11+, Expo CLI

1. Install dependencies:
  ```bash
  npm install
  cd Backend && pip install -r requirements.txt && cd ..
  ```
2. Configure `src/config.js` (API base URL)
3. Run backend:
  ```bash
  cd Backend
  python main.py
  # or: uvicorn main:app --reload --host 0.0.0.0 --port 8080
  ```
4. Run mobile app:
  ```bash
  npm start
  # or: expo start
  ```

---

## Usage

- Chatbot: Multi-session, LLM-powered
- Heartist Dashboard: Tasks, events, meetings
- Admin Dashboard: `/admin` for managing data

---

## AI Model Integration

1. Install Ollama ([instructions](https://ollama.com/download))
2. Download a model:
  ```bash
  ollama pull llama2
  # or: ollama pull mistral
  ```
3. Start Ollama server: `ollama serve`
4. Backend connects to Ollama at `http://localhost:11434`

---

## Authentication

- JWT-based, 30-min access tokens, 7-day refresh tokens
- See `Backend/config/jwt_config.py` for config

---

## API Endpoints (see `Backend/routes/`)

- `/api/auth/signin` (POST)
- `/api/session/list` (GET)
- `/api/session/new` (POST)
- `/api/chat/message` (POST)
- `/api/employee/tasks` (GET/POST)
- `/api/employee/events` (GET/POST)
- `/api/employee/meetings` (GET/POST)

---

## Customization

- Frontend: `app/`, `src/services/`, `src/config.js`
- Backend: `Backend/routes/`, `Backend/models/`, `Backend/controllers/chat.py`
- Knowledge: `Backend/knowledge.txt`

---

## Contributing

1. Fork the repo and create a feature branch
2. Make your changes and test thoroughly
3. Submit a pull request with a clear description

---

## License

Proprietary to Fairmont Hotels. All rights reserved.

---

## Support

For technical support, contact the development team or open an issue.