-- =============================================
-- 1. USER & AUTHENTICATION
-- =============================================
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('customer', 'supplier', 'staff', 'admin');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- Create users table (Base table for Login Auth)
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
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- =============================================
-- 2. PROFILE TABLES
-- =============================================
-- Customers Table (Extends users)
CREATE TABLE IF NOT EXISTS customers (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL
);
-- Suppliers Table (Extends users)
CREATE TABLE IF NOT EXISTS suppliers (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    company_name VARCHAR(150)
);
-- =============================================
-- 3. UTILITY FUNCTIONS & TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- =============================================
-- 4. BUSINESS LOGIC ENUMS
-- =============================================
DO $$ BEGIN CREATE TYPE order_status AS ENUM (
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Returned'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE booking_status AS ENUM (
    'Pending',
    'Confirmed',
    'In Progress',
    'Completed',
    'Cancelled'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('Pending', 'Completed', 'Failed', 'Refunded');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE slot_status AS ENUM (
    'Available',
    'Booked',
    'Maintenance',
    'Unavailable'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE restock_status AS ENUM (
    'Pending',
    'Approved',
    'Ordered',
    'Received',
    'Cancelled'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- =============================================
-- 5. PRODUCT, SERVICE & INVENTORY CATALOGUE
-- =============================================
-- Products Table
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(user_id) ON DELETE
    SET NULL,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00 CHECK (
            discount_percent >= 0
            AND discount_percent <= 100
        ),
        stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
        image_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Services Table
CREATE TABLE IF NOT EXISTS services (
    service_id SERIAL PRIMARY KEY,
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2)
);
-- Restock Requests Table
CREATE TABLE IF NOT EXISTS restock_requests (
    request_id SERIAL PRIMARY KEY,
    created_by_staff_id INTEGER REFERENCES users(id) ON DELETE
    SET NULL,
        supplier_id INTEGER REFERENCES suppliers(user_id) ON DELETE CASCADE,
        requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expected_date DATE,
        notes TEXT,
        status restock_status DEFAULT 'Pending',
        delivered_at TIMESTAMP WITH TIME ZONE,
        received_by_staff_id INTEGER REFERENCES users(id) ON DELETE
    SET NULL,
        delivery_note_ref VARCHAR(50),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Restock Items Table
CREATE TABLE IF NOT EXISTS restock_items (
    request_item_id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES restock_requests(request_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_cost) STORED
);
-- =============================================
-- 6. ORDERS, BOOKINGS & TIME SLOTS
-- =============================================
-- Service Time Slots Table
CREATE TABLE IF NOT EXISTS service_time_slots (
    slot_id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(service_id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status slot_status DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_slot_times CHECK (end_time > start_time)
);
-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(user_id) ON DELETE
    SET NULL,
        staff_id INTEGER REFERENCES users(id) ON DELETE
    SET NULL,
        order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status order_status DEFAULT 'Pending',
        total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- POS Walk-in Customers (non-authenticated customers for in-store sales)
CREATE TABLE IF NOT EXISTS pos_customers (
    pos_customer_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Link POS customer to order (POS orders will have customer_id NULL)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS pos_customer_id INTEGER REFERENCES pos_customers(pos_customer_id) ON DELETE SET NULL;
-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE
    SET NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);
-- Service Bookings Table
-- service_id is intentionally omitted: it is derivable via slot_id -> service_time_slots.service_id
-- slot_id uses RESTRICT so a booked slot cannot be deleted (correct business rule)
CREATE TABLE IF NOT EXISTS service_bookings (
    booking_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(user_id) ON DELETE CASCADE,
    slot_id INTEGER REFERENCES service_time_slots(slot_id) ON DELETE RESTRICT,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status booking_status DEFAULT 'Pending',
    service_phone VARCHAR(20),
    service_city VARCHAR(100),
    service_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- =============================================
-- 7. PAYMENTS, RECEIPTS & NOTIFICATIONS
-- =============================================
-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'Pending',
    transaction_reference VARCHAR(100),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- [NEW] Receipts Table
CREATE TABLE IF NOT EXISTS receipts (
    receipt_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE UNIQUE,
    -- Ensures 1 receipt per order
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255)
);
-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    report_id SERIAL PRIMARY KEY,
    generated_by INTEGER REFERENCES users(id) ON DELETE
    SET NULL,
        title VARCHAR(150) NOT NULL,
        report_type VARCHAR(50) NOT NULL,
        file_path VARCHAR(255),
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Refund Requests Table
-- Tracks pending refunds owed to customers who cancelled a paid order
CREATE TABLE IF NOT EXISTS refund_requests (
    refund_id    SERIAL PRIMARY KEY,
    order_id     INTEGER REFERENCES orders(order_id) ON DELETE CASCADE UNIQUE,
    payment_id   INTEGER REFERENCES payments(payment_id) ON DELETE SET NULL,
    customer_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    amount       DECIMAL(10, 2) NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'Pending',
    refund_ref   VARCHAR(100),
    admin_note   TEXT,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_refund_status CHECK (status IN ('Pending', 'Processing', 'Completed'))
);
-- =============================================
-- 8. INDEXES & FINAL TRIGGERS
-- =============================================
-- Existing Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_pos_customer ON orders(pos_customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON service_bookings(booking_date);
-- Time Slot Indexes
CREATE INDEX IF NOT EXISTS idx_slots_dates ON service_time_slots(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_slots_staff ON service_time_slots(staff_id);
CREATE INDEX IF NOT EXISTS idx_slots_status ON service_time_slots(status)
WHERE status = 'Available';
-- Restock Indexes
CREATE INDEX IF NOT EXISTS idx_restock_supplier ON restock_requests(supplier_id);
CREATE INDEX IF NOT EXISTS idx_restock_status ON restock_requests(status);
CREATE INDEX IF NOT EXISTS idx_restock_items_request ON restock_items(request_id);
CREATE INDEX IF NOT EXISTS idx_restock_items_product ON restock_items(product_id);
-- Update Timestamp Triggers
DROP TRIGGER IF EXISTS update_products_timestamp ON products;
CREATE TRIGGER update_products_timestamp BEFORE
UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_orders_timestamp ON orders;
CREATE TRIGGER update_orders_timestamp BEFORE
UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_bookings_timestamp ON service_bookings;
CREATE TRIGGER update_bookings_timestamp BEFORE
UPDATE ON service_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_restock_timestamp ON restock_requests;
CREATE TRIGGER update_restock_timestamp BEFORE
UPDATE ON restock_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- =============================================
-- 9. ORDER RETURNS
-- =============================================
DO $$ BEGIN CREATE TYPE return_status AS ENUM (
    'Pending',
    'Under Review',
    'Approved',
    'Rejected',
    'Refunded'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
CREATE TABLE IF NOT EXISTS order_returns (
    return_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE UNIQUE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status return_status DEFAULT 'Pending',
    refund_amount DECIMAL(10, 2) NOT NULL,
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_returns_order ON order_returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON order_returns(status);
DROP TRIGGER IF EXISTS update_returns_timestamp ON order_returns;
CREATE TRIGGER update_returns_timestamp BEFORE
UPDATE ON order_returns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 1. Rejected status eka add kirima (Check ekak ekka)
DO $$ BEGIN 
    ALTER TYPE restock_status ADD VALUE 'Rejected';
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Received status eka add kirima (Badu labuna kiyala mark karanna)
DO $$ BEGIN 
    ALTER TYPE restock_status ADD VALUE 'Received';
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Product-Supplier Bridge table eka
CREATE TABLE IF NOT EXISTS product_suppliers (
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES suppliers(user_id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    supply_price DECIMAL(10, 2),
    PRIMARY KEY (product_id, supplier_id)
);

-- 4. Rejection Notification Function
CREATE OR REPLACE FUNCTION notify_restock_rejection() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Rejected' AND OLD.status != 'Rejected' THEN
        INSERT INTO notifications (user_id, message, type)
        VALUES (NEW.created_by_staff_id, 'Restock Request #' || NEW.request_id || ' was rejected by the supplier', 'Alert');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Rejection Trigger
DROP TRIGGER IF EXISTS trg_on_restock_rejection ON restock_requests;
CREATE TRIGGER trg_on_restock_rejection
AFTER UPDATE ON restock_requests
FOR EACH ROW EXECUTE FUNCTION notify_restock_rejection();

-- 6. Auto Stock Update Function
CREATE OR REPLACE FUNCTION update_stock_after_restock() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Received' AND OLD.status != 'Received' THEN
        UPDATE products p
        SET stock_quantity = p.stock_quantity + ri.quantity
        FROM restock_items ri
        WHERE ri.product_id = p.product_id AND ri.request_id = NEW.request_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Auto Stock Update Trigger
DROP TRIGGER IF EXISTS trg_on_restock_received ON restock_requests;
CREATE TRIGGER trg_on_restock_received
AFTER UPDATE ON restock_requests
FOR EACH ROW EXECUTE FUNCTION update_stock_after_restock();

