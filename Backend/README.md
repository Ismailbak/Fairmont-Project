# Fairmont Backend

This is the backend server for the Fairmont mobile app, providing AI chatbot functionality using a local knowledge base.

## Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Make sure Python is installed on your system and accessible via `python` command.

3. The backend uses the following files:
   - `retriever.py`: Python script for knowledge retrieval
   - `knowledge.txt`: Knowledge base containing hotel information

## Running the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on port 3000 by default.

## API Endpoints

- `GET /`: Health check
- `GET /api/health`: Health check endpoint
- `POST /api/chat`: Chat endpoint that processes messages using the AI retriever

### Chat Endpoint

**POST /api/chat**

Request body:
```json
{
  "message": "What are the spa opening hours?"
}
```

Response:
```json
{
  "success": true,
  "context": "Opening Hours: Daily from 10:00 AM to 8:00 PM.",
  "originalMessage": "What are the spa opening hours?"
}
```

## Integration with Frontend

The backend is designed to work with the React Native mobile app. The frontend can make API calls to the `/api/chat` endpoint to get responses from the AI chatbot. 