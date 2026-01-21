-- Test Users for Role-Based Authentication Testing
-- Note: These passwords are hashed with bcrypt (password: "password123")
-- DO NOT use these in production!
-- Admin User
-- Email: admin@test.com
-- Password: password123
INSERT INTO users (
        email,
        password,
        first_name,
        last_name,
        role,
        is_active,
        email_verified
    )
VALUES (
        'admin@test.com',
        '$2b$10$YourHashedPasswordHere',
        'Admin',
        'User',
        'admin',
        true,
        true
    ) ON CONFLICT (email) DO NOTHING;
-- Staff User
-- Email: staff@test.com
-- Password: password123
INSERT INTO users (
        email,
        password,
        first_name,
        last_name,
        role,
        is_active,
        email_verified
    )
VALUES (
        'staff@test.com',
        '$2b$10$YourHashedPasswordHere',
        'Staff',
        'Member',
        'staff',
        true,
        true
    ) ON CONFLICT (email) DO NOTHING;
-- Supplier User
-- Email: supplier@test.com
-- Password: password123
INSERT INTO users (
        email,
        password,
        first_name,
        last_name,
        role,
        is_active,
        email_verified
    )
VALUES (
        'supplier@test.com',
        '$2b$10$YourHashedPasswordHere',
        'Supplier',
        'Company',
        'supplier',
        true,
        true
    ) ON CONFLICT (email) DO NOTHING;
-- Customer User
-- Email: customer@test.com
-- Password: password123
INSERT INTO users (
        email,
        password,
        first_name,
        last_name,
        role,
        is_active,
        email_verified
    )
VALUES (
        'customer@test.com',
        '$2b$10$YourHashedPasswordHere',
        'Customer',
        'User',
        'customer',
        true,
        true
    ) ON CONFLICT (email) DO NOTHING;
-- Note: To generate the actual password hash, run this in Node.js:
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('password123', 10).then(hash => console.log(hash));
--
-- Or use the registration endpoint to create users and then update their roles in the database.