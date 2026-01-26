-- Aquarium Management System - Database Schema
-- Users Table
-- Create enum for user roles
-- Roles: customer (default), supplier, staff, admin
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('customer', 'supplier', 'staff', 'admin');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    role user_role DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
-- Create refresh tokens table for JWT refresh token management
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Create index on user_id for refresh tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Trigger to auto-update updated_at on users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ENUM TYPES (For Data Integrity)
-- =============================================

-- Status for Orders (Pending, Paid, Shipped, etc.)
DO $$ BEGIN 
    CREATE TYPE order_status AS ENUM ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Status for Bookings (Pending, Confirmed, Completed, Cancelled)
DO $$ BEGIN 
    CREATE TYPE booking_status AS ENUM ('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Status for Payments
DO $$ BEGIN 
    CREATE TYPE payment_status AS ENUM ('Pending', 'Completed', 'Failed', 'Refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================
-- INVENTORY & CATALOGUE TABLES
-- =============================================

-- Products Table
-- 3NF: Depends on Supplier (User)
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- specific to users with role 'supplier'
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., Tank, Food, Accessory
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services Table (Catalog of services offered)
CREATE TABLE IF NOT EXISTS services (
    service_id SERIAL PRIMARY KEY,
    service_type VARCHAR(100) NOT NULL, -- e.g., Tank Cleaning, Installation
    description TEXT,
    base_price DECIMAL(10, 2) -- Optional base price for the service
);

-- =============================================
-- TRANSACTION TABLES (Orders & Bookings)
-- =============================================

-- Orders Table
-- Tracks the main order details. Links to Customer and optionally Staff (for Walk-ins).
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    staff_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Nullable: Online orders might not have immediate staff assignment
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status order_status DEFAULT 'Pending',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
-- Resolves the Many-to-Many relationship between Orders and Products.
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL, -- Price at the moment of purchase (historical data)
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED -- calculated column
);

-- Service Bookings Table
-- Tracks appointments. Links Customer and Service.
CREATE TABLE IF NOT EXISTS service_bookings (
    booking_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(service_id) ON DELETE SET NULL,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status booking_status DEFAULT 'Pending',
    notes TEXT, -- For specific customer requests
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FINANCIAL & SUPPORT TABLES
-- =============================================

-- Payments Table
-- 1:1 Relationship with Order (usually), but kept separate for security/gateway logic.
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL, -- e.g., 'Credit Card', 'Cash', 'PayPal'
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'Pending',
    transaction_reference VARCHAR(100), -- ID from payment gateway (Stripe/PayPal)
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
-- System alerts for Users (Order updates, Booking reminders)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'Order', 'Service', 'System'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports Table
-- Stores metadata about generated reports (files usually stored in cloud/disk)
CREATE TABLE IF NOT EXISTS reports (
    report_id SERIAL PRIMARY KEY,
    generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Admin/Staff who generated it
    title VARCHAR(150) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- e.g., 'Sales', 'Inventory'
    file_path VARCHAR(255),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES & TRIGGERS (Performance & Automation)
-- =============================================

-- Indexes for frequent searches
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON service_bookings(booking_date);

-- Trigger to update 'updated_at' timestamp automatically
-- (Reusing the function from your user table code)
CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_timestamp BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_timestamp BEFORE UPDATE ON service_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();