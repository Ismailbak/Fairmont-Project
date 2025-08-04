from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from config.database import Base, SQLALCHEMY_DATABASE_URL
from models.user import User
from models.user_activity import UserActivity
from passlib.context import CryptContext
import os

# Ensure the database directory exists
os.makedirs('instance', exist_ok=True)

# Initialize database connection
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create database tables
Base.metadata.create_all(bind=engine)

def create_admin_user():
    db = SessionLocal()
    
    # Admin credentials
    admin_email = "admin@fairmont.com"
    admin_password = "FairmontAdmin123!"  # In production, use environment variables
    
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if existing_admin:
        # Update existing user to admin
        existing_admin.is_admin = True
        print(f"Updated existing user {admin_email} to admin")
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
        print(f"Created new admin user: {admin_email}")
    
    db.commit()
    db.close()
    print("Admin setup completed successfully!")
    print(f"Email: {admin_email}")
    print("Password: FairmontAdmin123!")
    print("\nIMPORTANT: Change this password after first login!")

if __name__ == "__main__":
    create_admin_user()
