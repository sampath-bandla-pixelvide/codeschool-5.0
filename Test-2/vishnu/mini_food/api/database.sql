CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(150) NULL UNIQUE,
    password TEXT NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otp_codes (
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(150) NULL,
    mobile     VARCHAR(15)  NULL,
    otp        VARCHAR(10)  NOT NULL,
    purpose    VARCHAR(20)  NOT NULL CHECK (purpose IN ('login', 'reset_password', 'verify_email', 'verify_mobile')),
    is_used    BOOLEAN      NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP    NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    is_valid BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 day',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL DEFAULT 'Home',
    address TEXT NOT NULL,
    city VARCHAR(80) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE food_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE food_items (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES food_categories (id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    price NUMERIC(10, 2) NOT NULL,
    is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE food_photos (
    id SERIAL PRIMARY KEY,
    food_id INT NOT NULL REFERENCES food_items (id) ON DELETE CASCADE,
    photo_url VARCHAR(300) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id),
    address_id INT NOT NULL REFERENCES user_addresses (id),
    delivery_name VARCHAR(120) NOT NULL,
    delivery_mobile VARCHAR(15) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_pincode VARCHAR(10) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'placed' CHECK (
        status IN (
            'placed',
            'preparing',
            'out_for_delivery',
            'delivered',
            'cancelled'
        )
    ),
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    food_id INT NOT NULL REFERENCES food_items (id),
    food_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    line_total NUMERIC(10, 2) NOT NULL
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders (id),
    user_id INT NOT NULL REFERENCES users (id),
    method VARCHAR(15) NOT NULL DEFAULT 'cod' CHECK (
        method IN (
            'cod',
            'upi',
            'netbanking',
            'card',
            'wallet'
        )
    ),
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'success',
            'failed',
            'refunded'
        )
    ),
    transaction_id VARCHAR(150) NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
UPDATE users SET role = 'admin' where id=1;
ALTER TABLE otp_codes ALTER COLUMN email DROP NOT NULL;

ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS mobile VARCHAR(15) NULL;

ALTER TABLE otp_codes DROP CONSTRAINT IF EXISTS otp_codes_purpose_check;

ALTER TABLE otp_codes ADD CONSTRAINT otp_codes_purpose_check
    CHECK (purpose IN ('login', 'reset_password', 'verify_email', 'verify_mobile'));

CREATE TABLE IF NOT EXISTS category_photos (
    id          SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES food_categories(id) ON DELETE CASCADE,
    photo_url   VARCHAR(500) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS utr_reference VARCHAR(100) NULL;

ALTER TABLE orders DROP COLUMN IF EXISTS delivery_address;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_pincode;

CREATE TABLE IF NOT EXISTS site_settings (
    key        VARCHAR(100) PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
