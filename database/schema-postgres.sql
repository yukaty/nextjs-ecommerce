-- Users Table
CREATE TABLE next_ec_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    enabled BOOLEAN DEFAULT TRUE, -- FALSE after implementing email verification
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE next_ec_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE next_ec_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES next_ec_products(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES next_ec_users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites Table
CREATE TABLE next_ec_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES next_ec_users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES next_ec_products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Orders Table
CREATE TABLE next_ec_orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES next_ec_users(id) ON DELETE SET NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    stripe_session_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE next_ec_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES next_ec_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES next_ec_products(id),
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inquiries Table
CREATE TABLE next_ec_inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance (with next_ec_ prefix)
CREATE INDEX idx_next_ec_products_featured ON next_ec_products(is_featured);
CREATE INDEX idx_next_ec_products_created_at ON next_ec_products(created_at);
CREATE INDEX idx_next_ec_reviews_product_id ON next_ec_reviews(product_id);
CREATE INDEX idx_next_ec_favorites_user_id ON next_ec_favorites(user_id);
CREATE INDEX idx_next_ec_orders_user_id ON next_ec_orders(user_id);
CREATE INDEX idx_next_ec_orders_stripe_session ON next_ec_orders(stripe_session_id);

----------------------------------------------------------
-- Sample Data Insertion
----------------------------------------------------------

-- Insert sample users (password is 'password' hashed with bcrypt)
INSERT INTO next_ec_users (name, email, password_hash, is_admin, enabled) VALUES
('Admin User', 'admin@example.com', '$2a$10$2JNjTwZBwo7fprL2X4sv.OEKqxnVtsVQvuXDkI8xVGix.U3W5B7CO', true, true),
('Demo User', 'demo@example.com', '$2a$10$2JNjTwZBwo7fprL2X4sv.OEKqxnVtsVQvuXDkI8xVGix.U3W5B7CO', false, true);

-- Insert sample products
INSERT INTO next_ec_products (name, description, price, stock, is_featured) VALUES
('Sample Product 1', 'This is a great product for testing', 29.99, 10, false),
('Sample Product 2', 'Another amazing product', 19.99, 5, false),
('Sample Product 3', 'Featured product for homepage', 39.99, 15, true),
('Sample Product 4', 'This is a great product for testing', 29.99, 10, false),
('Sample Product 5', 'Another amazing product', 19.99, 5, false),
('Sample Product 6', 'Featured product for homepage', 39.99, 15, true),
('Sample Product 7', 'This is a great product for testing', 29.99, 10, false),
('Sample Product 8', 'Another amazing product', 19.99, 5, false),
('Sample Product 9', 'Featured product for homepage', 39.99, 15, true),
('Sample Product 10', 'This is a great product for testing', 29.99, 10, false);

