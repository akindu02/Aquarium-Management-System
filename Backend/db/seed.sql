-- Aquarium Management System - Sample Data
-- Note: Passwords are hashed using bcrypt. 
-- The sample password for all users below is: Password123!
-- Clear existing data (be careful in production!)
-- TRUNCATE users RESTART IDENTITY CASCADE;
-- Insert sample users
-- Password: Password123! (hashed with bcrypt)
-- Roles: customer, supplier, staff, admin
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
        'staff@aquarium.com',
        '$2a$10$rG7VfEKJxNCM1OqOvXfMZOx9DKmNkYVvuJkJnQGXKHXoQiHCqQCXa',
        'John',
        'Staff',
        'staff',
        '+1234567891',
        true,
        true
    ),
    (
        'supplier@aquarium.com',
        '$2a$10$rG7VfEKJxNCM1OqOvXfMZOx9DKmNkYVvuJkJnQGXKHXoQiHCqQCXa',
        'Fish',
        'Supplier',
        'supplier',
        '+1234567892',
        true,
        true
    ),
    (
        'customer@aquarium.com',
        '$2a$10$rG7VfEKJxNCM1OqOvXfMZOx9DKmNkYVvuJkJnQGXKHXoQiHCqQCXa',
        'Jane',
        'Customer',
        'customer',
        '+1234567893',
        true,
        false
    ) ON CONFLICT (email) DO NOTHING;