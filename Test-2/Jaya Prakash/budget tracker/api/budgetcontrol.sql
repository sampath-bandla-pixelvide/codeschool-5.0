-- Active: 1775629728003@@127.0.0.1@5432@budgetcontrolapp@public

create Table users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(30),
    phone_number VARCHAR(10) NOT NULL UNIQUE check (length(phone_number) = 10),
    email VARCHAR(50) UNIQUE,
    password TEXT NOT NULL,
    photo TEXT,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id),
    token VARCHAR(20) UNIQUE NOT NULL,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 day',
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100),
    otp VARCHAR(225),
    otp_expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '10 minutes',
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE temp_tokens (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    token VARCHAR(30) NOT NULL UNIQUE,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 minutes',
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM temp_tokens;

SELECT * FROM otps;

SELECT * FROM users;

SELECT * FROM user_tokens;

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    user_id int NOT NULL REFERENCES users (id),
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * from categories;

CREATE TABLE income (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id),
    amount INT NOT NULL check (amount > 0),
    income_date DATE,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * from income;

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id),
    category_id INT NOT NULL REFERENCES categories (id),
    title VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    amount_spent INT NOT NULL check (amount_spent > 0),
    spent_date DATE NOT NULL
);

ALTER TABLE expenses add COLUMN status BOOLEAN DEFAULT true;

SELECT DISTINCT
    TO_CHAR(income_date, 'YYYY-MM') AS month
FROM income
WHERE
    user_id = 1
ORDER BY month DESC;

SELECT * from expenses;