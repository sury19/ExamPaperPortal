-- Initialize database
-- This script runs automatically when the PostgreSQL container starts

-- Create the database if it doesn't exist
-- (Already created by POSTGRES_DB env var, but this ensures it)

-- Enable any useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- The tables will be created automatically by SQLAlchemy on first run
-- from main.py: Base.metadata.create_all(bind=engine)

-- You can pre-populate test data here if needed:
-- Example:
-- INSERT INTO users (email, name, password_hash, is_admin, email_verified, created_at)
-- VALUES ('admin@example.com', 'Admin User', '$2b$12$...', true, true, now());
