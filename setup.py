# setup.py - Run this once to create admin account and sample data
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from main import Base, User, Course
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/paper_portal")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")

def create_admin_user(email, name, password):
    """Create an admin user"""
    db = SessionLocal()
    try:
        # Check if user exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"✗ User {email} already exists")
            return
        
        # Create admin
        hashed_password = pwd_context.hash(password)
        admin = User(
            email=email,
            name=name,
            password_hash=hashed_password,
            is_admin=True,
            email_verified=True  # Admins are pre-verified
        )
        db.add(admin)
        db.commit()
        print(f"✓ Admin user created: {email}")
        print(f"  Password: {password}")
        return admin
    except Exception as e:
        print(f"✗ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

def create_sample_courses():
    """Create some sample courses"""
    db = SessionLocal()
    try:
        sample_courses = [
            {"code": "CS1108", "name": "Python Programming", "description": "Introduction to Python programming"},
            {"code": "CS2201", "name": "Data Structures", "description": "Advanced data structures and algorithms"},
            {"code": "CS3301", "name": "Database Systems", "description": "Relational databases and SQL"},
            {"code": "CS4401", "name": "Machine Learning", "description": "Introduction to ML algorithms"},
        ]
        
        for course_data in sample_courses:
            existing = db.query(Course).filter(Course.code == course_data["code"]).first()
            if not existing:
                course = Course(**course_data)
                db.add(course)
                print(f"✓ Course created: {course_data['code']}")
            else:
                print(f"  Course {course_data['code']} already exists")
        
        db.commit()
    except Exception as e:
        print(f"✗ Error creating courses: {e}")
        db.rollback()
    finally:
        db.close()

def create_student_user(email, name, password):
    """Create a regular student user"""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"✗ User {email} already exists")
            return
        
        hashed_password = pwd_context.hash(password)
        student = User(
            email=email,
            name=name,
            password_hash=hashed_password,
            is_admin=False,
            email_verified=False  # Students will verify via OTP when they login
        )
        db.add(student)
        db.commit()
        print(f"✓ Student user created: {email}")
        print(f"  Password: {password} (for testing - students should use OTP in production)")
        return student
    except Exception as e:
        print(f"✗ Error creating student: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("PAPER PORTAL - SETUP SCRIPT")
    print("=" * 60)
    print()
    
    # Step 1: Create tables
    create_tables()
    print()
    
    # Step 2: Create admin user
    print("Creating admin user...")
    create_admin_user(
        email="admin@university.edu",
        name="Admin User",
        password="admin123"  # CHANGE THIS IN PRODUCTION!
    )
    print()
    
    # Step 3: Create sample courses
    print("Creating sample courses...")
    create_sample_courses()
    print()
    
    # Step 4: Create sample student
    print("Creating sample student user...")
    create_student_user(
        email="student@university.edu",
        name="John Doe",
        password="student123"  # CHANGE THIS IN PRODUCTION!
    )
    print()
    
    print("=" * 60)
    print("SETUP COMPLETE!")
    print("=" * 60)
    print()
    print("You can now:")
    print("1. Start the API: uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}")
    print("2. Access admin dashboard at: http://localhost:10000/docs (or PORT env var)")
    print()
    print("Admin Credentials:")
    print("  Email: admin@university.edu")
    print("  Password: admin123")
    print()
    print("Student Credentials:")
    print("  Email: student@university.edu")
    print("  Password: student123")
    print()
    print("⚠️  IMPORTANT: Change these passwords in production!")
    print("=" * 60)