-- Aquarium Management System - Sample Data
-- Note: Passwords are hashed using bcrypt. 
-- The sample password for all users below is: Password123!
-- Clear existing data (be careful in production!)
-- TRUNCATE users RESTART IDENTITY CASCADE;
-- Insert sample users
-- Password: Password123! (hashed with bcrypt)
INSERT INTO users (
        email,
        password,
        first_name,
        last_name,
        role,
        phone,
        is_active,
        email_verified
    )
VALUES (
        'admin@aquarium.com',
        '$2a$10$rG7VfEKJxNCM1OqOvXfMZOx9DKmNkYVvuJkJnQGXKHXoQiHCqQCXa',
        'Admin',
        'User',
        'admin',
        '+1234567890',
        true,
        true
    ),
    (
        'manager@aquarium.com',
        '$2a$10$rG7VfEKJxNCM1OqOvXfMZOx9DKmNkYVvuJkJnQGXKHXoQiHCqQCXa',
        'John',
        'Manager',
        'manager',
        '+1234567891',
        true,
        true
    ),
    (
        'user@aquarium.com',
        '$2a$10$rG7VfEKJxNCM1OqOvXfMZOx9DKmNkYVvuJkJnQGXKHXoQiHCqQCXa',
        'Jane',
        'Doe',
        'user',
        '+1234567892',
        true,
        false
    ) ON CONFLICT (email) DO NOTHING;