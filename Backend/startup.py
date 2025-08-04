#!/usr/bin/env python3
"""
Startup script for the Fairmont Admin Dashboard
This script initializes the database and ensures the admin user exists.
"""

import os
import sys
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from config.database import Base, SQLALCHEMY_DATABASE_URL, init_db
from models.user import User
from models.user_activity import UserActivity
from passlib.context import CryptContext

def setup_database():
    """Initialize database and create tables"""
    print("🔧 Setting up database...")
    
    # Create engine and initialize database
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create all tables
    init_db()
    print("✅ Database tables created successfully")
    
    return SessionLocal

def ensure_admin_user():
    """Ensure admin user exists"""
    print("👤 Setting up admin user...")
    
    SessionLocal = setup_database()
    db = SessionLocal()
    
    try:
        # Admin credentials
        admin_email = "admin@fairmont.com"
        admin_password = "FairmontAdmin123!"
        
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if existing_admin:
            # Update existing user to admin if needed
            if not existing_admin.is_admin:
                existing_admin.is_admin = True
                existing_admin.is_active = True
                db.commit()
                print(f"✅ Updated existing user {admin_email} to admin")
            else:
                print(f"✅ Admin user {admin_email} already exists")
        else:
            # Create new admin user
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            hashed_password = pwd_context.hash(admin_password)
            
            admin_user = User(
                email=admin_email,
                hashed_password=hashed_password,
                full_name="Admin User",
                is_admin=True,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print(f"✅ Created new admin user: {admin_email}")
        
        print("\n🎉 Admin setup completed successfully!")
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Password: {admin_password}")
        print("\n⚠️  IMPORTANT: Change this password after first login!")
        print("\n🚀 You can now access the admin dashboard at: http://localhost:8001/admin")
        
    except Exception as e:
        print(f"❌ Error setting up admin user: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

def main():
    """Main startup function"""
    print("🚀 Starting Fairmont Admin Dashboard setup...")
    print("=" * 50)
    
    try:
        ensure_admin_user()
        print("\n" + "=" * 50)
        print("🎉 Setup completed successfully!")
        print("\nTo start the server, run:")
        print("cd Backend && python main.py")
        
    except Exception as e:
        print(f"\n❌ Setup failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()