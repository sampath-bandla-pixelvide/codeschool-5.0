-- Active: 1775629720989@@127.0.0.1@5432@test@public

create Table users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(30),
    phone_number VARCHAR(10) NOT NULL UNIQUE check (length(phone_number) = 10),
    email VARCHAR(50) UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL,
    password TEXT NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
ADD COLUMN role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'));

CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id),
    token VARCHAR(20) UNIQUE NOT NULL,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '2 days',
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100),
    phone_number VARCHAR(10),
    otp VARCHAR(6) NOT NULL,
    otp_expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '10 minutes',
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE temp_tokens (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100),
    phone_number VARCHAR(10),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '2 minutes',
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    full_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(10) NOT NULL,
    purpose VARCHAR(100) NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE appointments
ADD COLUMN token_number SERIAL UNIQUE;
ALTER TABLE appointments
DROP COLUMN status; 

ALTER TABLE appointments
ADD COLUMN status VARCHAR(20)
DEFAULT 'Waiting';

INSERT INTO appointments 
(user_id, full_name, mobile_number, purpose)
VALUES
(3, 'Ravi Kumar', '9876543210', 'Consultation'),
(3, 'Sneha Reddy', '9123456780', 'Follow-up'),
(3, 'Arjun Patel', '9988776655', 'General Checkup');

SELECT * FROM appointments;

INSERT INTO
    users (
        first_name,
        last_name,
        email,
        phone_number,
        date_of_birth,
        password,
        role
    )
VALUES (
        'Admin',
        'User',
        'admin@gmail.com',
        '9876543220',
        '2000-01-01',
        md5('Admin@123'),
        'admin'
    );

SELECT * FROM users;

SELECT * FROM user_tokens;

SELECT * FROM temp_tokens;

DROP Table temp_tokens;