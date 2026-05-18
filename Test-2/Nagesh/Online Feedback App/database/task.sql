-- Active: 1775750114059@@127.0.0.1@5432@test2@public
create table users(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(200) NOT NULL,
    last_name VARCHAR(200) NOT NULL,
    email VARCHAR(220) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    phone VARCHAR(10) NOT NULL CHECK (phone ~ '^[6-9][0-9]{9}$'),
    password VARCHAR(225) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    avatar VARCHAR(255)
);
select * FROM users;
CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token VARCHAR(225) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '10 days',
    is_active BOOLEAN DEFAULT true
);
select * from user_tokens;
create table otps(
    id SERIAL PRIMARY KEY,
    email_id VARCHAR(225),
    otp VARCHAR(225),
    status BOOLEAN DEFAULT true NOT NULL,
    expire_at TIMESTAMP DEFAULT current_timestamp + interval '2 minutes',
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_path TEXT NOT NULL,
    feedback_end_time TIMESTAMP NOT NULL,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
select * from products;
CREATE TABLE feedbacks (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    feedback TEXT NOT NULL,
    rating INT CHECK(
        rating >= 1
        AND rating <= 5
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
select * from feedbacks;

INSERT INTO users
(
    first_name,
    last_name,
    email,
    dob,
    phone,
    password,
    role
)
VALUES
(
    'Nagesh',
    'D',
    'dnagesh@gmail.com',
    '2000-01-01',
    '9876543219',
    MD5('Admin@123'),
    'admin'
);

select * from users;

