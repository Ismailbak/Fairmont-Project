# Fairmont Admin Dashboard

A comprehensive admin dashboard for managing Fairmont Hotel operations with user activity monitoring, statistics, and secure authentication.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation & Setup

1. **Install dependencies:**
   ```bash
   sudo apt update
   sudo apt install -y python3-venv python3-pip
   ```

2. **Create virtual environment and install packages:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install fastapi uvicorn sqlalchemy passlib python-jose[cryptography] python-multipart requests bcrypt email-validator
   ```

3. **Initialize database and create admin user:**
   ```bash
   python startup.py
   ```

4. **Start the server:**
   ```bash
   ./start_server.sh
   ```

## 📍 Access Points

- **Admin Dashboard**: http://localhost:8001/admin
- **API Documentation**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## 👤 Admin Credentials

- **Email**: `admin@fairmont.com`
- **Password**: `FairmontAdmin123!`

⚠️ **Important**: Change the password after first login!

## 🔧 Features

### ✅ Fixed Issues
- **API Port Mismatch**: Fixed frontend to use correct port (8001)
- **Admin Authorization**: Added proper admin privilege verification
- **Database Consistency**: Standardized database configuration
- **Security Improvements**: Enhanced JWT handling and validation
- **Error Handling**: Comprehensive error handling throughout
- **Missing Dependencies**: Added all required packages

### 🎯 Admin Dashboard Features
- **User Management**: View all users and their statistics
- **Activity Monitoring**: Track user activities and system usage
- **Real-time Statistics**: Live dashboard with user metrics
- **Secure Authentication**: JWT-based authentication with admin verification
- **Responsive Design**: Modern UI with Tailwind CSS
- **Auto-refresh**: Dashboard updates automatically every 30 seconds

### 🔒 Security Features
- **JWT Authentication**: Secure token-based authentication
- **Admin Verification**: Proper admin privilege checks
- **Password Hashing**: Bcrypt password hashing
- **Input Validation**: Comprehensive input validation
- **CORS Protection**: Configurable CORS settings

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Admin (Protected)
- `GET /api/admin/verify-admin` - Verify admin privileges
- `GET /api/admin/user-stats` - Get user statistics
- `GET /api/admin/user-activities` - Get user activities
- `GET /api/admin/dashboard-stats` - Get dashboard statistics
- `GET /api/admin/my-activities` - Get current user's activities

### General
- `GET /health` - Health check
- `GET /admin` - Admin dashboard HTML
- `POST /chat` - Chat with LLM (requires authentication)

## 📁 Project Structure

```
Backend/
├── config/              # Configuration files
│   ├── database.py      # Database configuration
│   └── jwt_config.py    # JWT settings
├── controllers/         # Business logic
│   └── auth.py         # Authentication logic
├── middleware/          # Middleware components
│   └── auth_middleware.py
├── models/             # Database models
│   ├── user.py         # User model
│   └── user_activity.py # Activity tracking
├── routes/             # API routes
│   ├── auth_routes.py  # Authentication routes
│   └── admin_routes.py # Admin routes
├── static/             # Static files
├── main.py             # Main application
├── startup.py          # Database initialization
├── start_server.sh     # Server startup script
└── admin_dashboard.html # Admin dashboard UI
```

## 🚀 Server Management

### Start Server
```bash
./start_server.sh
```

### Stop Server
```bash
pkill -f uvicorn
```

### View Logs
```bash
tail -f server.log
```

### Restart Server
```bash
pkill -f uvicorn
./start_server.sh
```

## 🔧 Configuration

### Environment Variables
- `JWT_SECRET_KEY` - JWT secret key (default: development key)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration (default: 30)
- `REFRESH_TOKEN_EXPIRE_DAYS` - Refresh token expiration (default: 7)

### Database
- **Type**: SQLite
- **File**: `dev.db`
- **Location**: Backend directory

## 🐛 Troubleshooting

### Server Won't Start
1. Check if port 8001 is available
2. Verify all dependencies are installed
3. Check server.log for error messages

### Can't Access Dashboard
1. Verify server is running: `curl http://localhost:8001/health`
2. Check firewall settings
3. Ensure admin user exists: `python startup.py`

### Login Issues
1. Verify admin credentials
2. Check database connection
3. Review authentication logs

## 📝 Development

### Adding New Features
1. Create models in `models/`
2. Add routes in `routes/`
3. Update admin dashboard HTML
4. Test thoroughly

### Database Changes
1. Update models
2. Run `python startup.py` to recreate tables
3. Test with existing data

## 🔐 Security Notes

- Change default admin password immediately
- Use environment variables for sensitive data in production
- Regularly update dependencies
- Monitor access logs
- Implement rate limiting for production

## 📞 Support

For issues or questions:
1. Check server logs: `tail -f server.log`
2. Verify configuration files
3. Test API endpoints: http://localhost:8001/docs

---

**🎉 Your Fairmont Admin Dashboard is now ready to use!**