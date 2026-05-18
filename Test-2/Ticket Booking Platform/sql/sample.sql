-- Active: 1775629722491@@127.0.0.1@5432@sample@public
create table users(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(200) NOT NULL,
    last_name VARCHAR(200) NOT NULL,
    email VARCHAR(220) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    phone VARCHAR(10) NOT NULL
        CHECK (phone ~ '^[6-9][0-9]{9}$'),
    password VARCHAR(225)  NOT NULL
);

CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token VARCHAR(225) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '10 days',
    is_active BOOLEAN DEFAULT true
);


create table otps(
    id SERIAL PRIMARY KEY,
    email_id VARCHAR(225),
    otp VARCHAR(225),
    status BOOLEAN DEFAULT true NOT NULL,
    expire_at TIMESTAMP DEFAULT current_timestamp + interval '2 minutes',
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

select * from user_tokens;

SELECT * from otps;

