# Fairmont Mobile App

A React Native mobile application for Fairmont Hotels with an integrated AI chatbot powered by a local knowledge base.

## Project Structure

```
fairmont-mobile/
├── app/                    # React Native app screens
│   ├── chatbot.jsx        # AI chatbot interface
│   ├── config.js          # App configuration
│   ├── index.jsx          # Main app screen
│   ├── login.jsx          # Login screen
│   ├── settings.jsx       # Settings screen
│   └── ...                # Other screens
├── Backend/               # Node.js backend server
│   ├── server.js          # Express server
│   ├── retriever.py       # Python knowledge retriever
│   ├── knowledge.txt      # Hotel knowledge base
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
├── assets/                # App assets (images, icons)
└── package.json           # Frontend dependencies
```

## Features

- **AI Chatbot**: Intelligent hotel assistant with local knowledge base
- **Modern UI**: Beautiful, responsive design with Fairmont branding
- **Real-time Chat**: Instant responses from the AI system
- **Cross-platform**: Works on iOS and Android

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.7 or higher)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Setup Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd Backend
npm install
cd ..
```

### 2. Start the Backend Server

```bash
# Start the backend server (development mode)
npm run backend:dev

# Or start it manually
cd Backend
npm run dev
```

The backend will start on `http://localhost:3000`

### 3. Start the Mobile App

```bash
# Start both backend and frontend simultaneously
npm run dev

# Or start them separately
npm start  # Frontend only
```

### 4. Run on Device/Simulator

- **iOS**: Press `i` in the terminal or run `npm run ios`
- **Android**: Press `a` in the terminal or run `npm run android`
- **Web**: Press `w` in the terminal or run `npm run web`

## API Endpoints

### Backend API

- `GET /` - Health check
- `GET /api/health` - Health check endpoint
- `POST /api/chat` - Chat endpoint

### Chat API Usage

```javascript
// Example API call
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'What are the spa opening hours?'
  })
});

const data = await response.json();
console.log(data.context); // AI response
```

## Configuration

### Backend Configuration

Edit `Backend/server.js` to modify:
- Server port (default: 3000)
- Python path
- CORS settings

### Frontend Configuration

Edit `app/config.js` to modify:
- API base URL
- App settings
- Endpoint URLs

## Development

### Backend Development

The backend uses:
- **Express.js** for the web server
- **Python** for AI knowledge retrieval
- **python-shell** for Node.js/Python integration

### Frontend Development

The frontend uses:
- **React Native** with Expo
- **Expo Router** for navigation
- **Modern JavaScript** features

## Troubleshooting

### Common Issues

1. **Backend not starting**: Check if Python is installed and accessible
2. **API connection errors**: Verify the backend is running on port 3000
3. **Mobile app not connecting**: Check network settings and localhost access

### Debug Commands

```bash
# Check if backend is running
curl http://localhost:3000/api/health

# Test Python retriever
cd Backend
python retriever.py "test message"

# Check mobile app logs
npx expo logs
```

## Knowledge Base

The AI system uses a local knowledge base (`Backend/knowledge.txt`) containing information about:
- Hotel services and amenities
- Spa and wellness facilities
- Security procedures
- Guest services
- And more...

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary to Fairmont Hotels.

## Support

For technical support, contact the development team. 