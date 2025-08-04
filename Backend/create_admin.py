from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from config.database import Base, SQLALCHEMY_DATABASE_URL, init_db
from models.user import User
from models.user_activity import UserActivity
from passlib.context import CryptContext
import os

# Initialize database connection
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create database tables
init_db()

def create_admin_user():
    db = SessionLocal()
    
    try:
        # Admin credentials
        admin_email = "admin@fairmont.com"
        admin_password = "FairmontAdmin123!"  # In production, use environment variables
        
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if existing_admin:
            # Update existing user to admin
            existing_admin.is_admin = True
            existing_admin.is_active = True
            db.commit()
            print(f"✅ Updated existing user {admin_email} to admin")
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
        print(f"❌ Error creating admin user: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
