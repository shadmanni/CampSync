-- CampusSync PostgreSQL Database Schema (Render Managed PostgreSQL)
-- campsync_db

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    hostel VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_verifications (
    email VARCHAR(255) PRIMARY KEY,
    otp_code VARCHAR(16) NOT NULL,
    attempts_remaining INTEGER DEFAULT 5,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    request_count INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(64) PRIMARY KEY,
    author_id VARCHAR(64) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(64) DEFAULT 'General',
    upvotes INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(64) PRIMARY KEY,
    post_id VARCHAR(64) REFERENCES posts(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(64) PRIMARY KEY,
    seller_id VARCHAR(64) NOT NULL,
    seller_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    starting_price NUMERIC(10, 2) NOT NULL,
    current_bid NUMERIC(10, 2) NOT NULL,
    highest_bidder_id VARCHAR(64),
    highest_bidder_name VARCHAR(255) DEFAULT 'No bids yet',
    bid_count INTEGER DEFAULT 0,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    category VARCHAR(64) DEFAULT 'General',
    expires_at VARCHAR(64) DEFAULT 'In 24 hours',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bids (
    id VARCHAR(64) PRIMARY KEY,
    item_id VARCHAR(64) REFERENCES items(id) ON DELETE CASCADE,
    bidder_id VARCHAR(64) NOT NULL,
    bidder_name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rides (
    id VARCHAR(64) PRIMARY KEY,
    driver_id VARCHAR(64) NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    departure_time VARCHAR(128) NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    price_per_seat NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS passengers (
    id VARCHAR(64) PRIMARY KEY,
    ride_id VARCHAR(64) REFERENCES rides(id) ON DELETE CASCADE,
    passenger_id VARCHAR(64) NOT NULL,
    passenger_name VARCHAR(255) NOT NULL,
    seats_booked INTEGER DEFAULT 1,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(64) PRIMARY KEY,
    organizer_id VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    venue VARCHAR(255) NOT NULL,
    date_time VARCHAR(128) NOT NULL,
    attendees_count INTEGER DEFAULT 0,
    category VARCHAR(64) DEFAULT 'Campus',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deals (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    is_partner BOOLEAN DEFAULT FALSE,
    discount_percent INTEGER NOT NULL,
    code VARCHAR(64),
    category VARCHAR(64),
    distance VARCHAR(64),
    valid_until VARCHAR(128)
);

-- Indices for efficient querying
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_rides_available ON rides(available_seats);
