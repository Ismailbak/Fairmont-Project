# Fairmont Mobile & Backend Platform

An advanced mobile and backend platform for Fairmont Tazi Palace Tangier, featuring:

- A modern React Native app (Expo) for guests and Heartists (employees)
- A FastAPI Python backend with RAG-powered AI chatbot, multi-session chat, and admin dashboard
- Personalized Heartist dashboard, admin data entry, and secure authentication
- Role-based access for hotel guests, employees, and administrators

## Features

- AI Chatbot with RAG (Retrieval-Augmented Generation) using Ollama/Mistral
- Personalized Heartist (Employee) Dashboard for task management
- Guest-specific interface for hotel information and services
- Admin Dashboard with user management and analytics
- Multi-session chat with persistent history
- Role-based access control with JWT authentication
- Cross-platform compatibility (iOS, Android, Web)

## Project Structure
```
fairmont-mobile/
├── app/                   # React Native screens
│   ├── components/        # Reusable UI components
│   ├── chatbot.jsx        # Chatbot interface
│   ├── chatbot_protected.jsx # Auth-protected chat
│   ├── employee_dashboard.jsx # Heartist dashboard
│   ├── signin.jsx         # Authentication screens
│   └── ...
├── src/                   
│   ├── services/          # API communication modules
│   │   ├── authService.js # Authentication functions
│   │   ├── employeeService.js # Employee data operations
│   │   └── sessionService.js # Chat session management
│   └── config.js          # Application configuration
├── assets/                # Images, icons, and media files
├── retriever.py           # RAG implementation for AI context
├── Backend/               # FastAPI Python backend
│   ├── main.py            # Application entry point
│   ├── routes/            # API route definitions
│   ├── controllers/       # Business logic
│   ├── models/            # Database models
│   ├── middleware/        # Auth and request processing
│   ├── config/            # Backend configuration
│   ├── utils/             # Helper utilities
│   ├── static/            # Static assets
│   ├── knowledge.txt      # Hotel information database
│   └── ...
└── package.json           # Project dependencies
```

## Getting Started

### Prerequisites:

- Node.js (v16+)
- Python 3.11+
- Expo CLI

### Installation:

1. Install dependencies:
```bash
npm install
cd Backend && pip install -r requirements.txt && cd ..
```

2. Configure API base URL in `src/config.js`.

3. Run backend:
```bash
cd Backend
python main.py
# or:
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

4. Run mobile app:
```bash
npm start
# or:
expo start
```

## Usage

### For Hotel Guests
- **AI Chatbot**: Access comprehensive hotel information through a conversational interface
- **Multi-session**: Continue conversations across multiple sessions with full history
- **Personalized Experience**: Get tailored responses based on preferences and history

### For Heartists (Employees)
- **Task Dashboard**: View, manage, and update assigned tasks
- **Event Calendar**: Track hotel events, meetings, and appointments
- **Performance Metrics**: View guest satisfaction and task completion statistics

### For Administrators
- **Admin Dashboard**: Access via `/admin` endpoint for comprehensive management
- **User Management**: Monitor user activity and manage permissions
- **System Analytics**: Track usage patterns, popular queries, and response effectiveness

## AI Model Integration (RAG Architecture)

This project implements a Retrieval-Augmented Generation (RAG) architecture to provide accurate, contextual responses about hotel services and information.

1. **Install Ollama** ([instructions](https://ollama.com/download))

2. **Download a supported model**:
```bash
ollama pull mistral  # Recommended model
# Alternative models:
# ollama pull llama2
# ollama pull mistral-7b
```

3. **Start Ollama server**:
```bash
ollama serve
```

4. The backend connects to Ollama at `http://localhost:11434` and enhances AI responses by:
   - Retrieving relevant context from `knowledge.txt`
   - Providing that context to the LLM for accurate answers
   - Caching frequent responses for improved performance
   - Handling conversation context across multiple messages

## Authentication & Security

- **JWT-based Authentication**: Secure token-based authentication system
- **Token Management**: 30-minute access tokens with 7-day refresh tokens
- **Role-based Access Control**: Different permissions for guests, employees, and admins
- **Protected Routes**: Authorization middleware for secure endpoint access
- **Password Security**: Bcrypt hashing for secure password storage
- **Activity Logging**: Comprehensive audit trail of user actions
- **Configuration**: Security settings in `Backend/config/jwt_config.py`

## API Endpoints

The backend provides a comprehensive API for all application functions (see `Backend/routes/` for implementation details):

### Authentication
- `/api/auth/signin` (POST): User login
- `/api/auth/signup` (POST): User registration
- `/api/auth/reset-password` (POST): Password reset

### Chat & Sessions
- `/api/session/list` (GET): Get user's chat sessions
- `/api/session/new` (POST): Create a new chat session
- `/api/chat/message` (POST): Send/receive chat messages
- `/api/chat/session/{session_id}` (GET): Get messages for a specific session
- `/chat` (POST): Direct AI communication endpoint

### Employee (Heartist) Management
- `/api/employee/tasks` (GET/POST): View and manage tasks
- `/api/employee/events` (GET/POST): View and manage events
- `/api/employee/meetings` (GET/POST): View and manage meetings

### Admin Functions
- `/api/admin/user-activities` (GET): View user activity logs
- `/api/admin/user-stats` (GET): Get system usage statistics
- `/admin` (GET): Access the admin dashboard interface

## Customization & Extension

### Frontend Customization
- **UI Components**: Modify React components in `app/` directory
- **API Integration**: Update service modules in `src/services/`
- **Configuration**: Adjust API endpoints and settings in `src/config.js`
- **Styling**: Update stylesheets for branding consistency

### Backend Customization
- **API Endpoints**: Extend routes in `Backend/routes/`
- **Data Models**: Modify database models in `Backend/models/`
- **Business Logic**: Update controllers in `Backend/controllers/`
- **Authentication**: Configure security in `Backend/config/jwt_config.py`

### AI & Knowledge Base
- **Hotel Information**: Update `Backend/knowledge.txt` with hotel-specific details
- **RAG System**: Modify retrieval logic in `retriever.py`
- **AI Prompts**: Adjust system prompts in `Backend/controllers/chat.py`
- **Model Selection**: Change AI model in configuration

## Development Process

### Contributing
1. Fork the repository and create a feature branch
2. Make your changes and test thoroughly across all user roles
3. Ensure AI responses are accurate and contextually appropriate
4. Submit a pull request with a clear description of changes

### Testing
- **Frontend**: Test on iOS, Android, and Web platforms
- **Backend**: Run API tests for all endpoints
- **AI**: Validate responses against knowledge base
- **Security**: Verify authentication and authorization flows

## License & Attribution

- Proprietary to Fairmont Hotels & Resorts, part of Accor Group.
- Developed for Fairmont Tazi Palace Tangier.
- All rights reserved.

## Support & Contact

- **Technical Support**: Contact the IT development team
- **Project Management**: Aziz Taifour, IT Manager
- **Documentation**: See additional resources in project Wiki
- **Issues**: Report bugs through the internal ticketing system