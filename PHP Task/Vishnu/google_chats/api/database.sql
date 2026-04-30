-- Active: 1775629723302@@127.0.0.1@5432@google_classroom@public


CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
SELECT * FROM otps;

CREATE TABLE otps(
    id SERIAL PRIMARY KEY,
    email_id VARCHAR(150) NOT NULL,
    otp VARCHAR(225) NOT NULL,
    expires_at TIMESTAMP DEFAULT (
        CURRENT_TIMESTAMP + INTERVAL '5 minutes'
    ),
    status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS users_token (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP DEFAULT (
        CURRENT_TIMESTAMP + INTERVAL '1 day'
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO users (first_name, last_name, email) VALUES
('Vishnu', 'Varma', 'vishnu.varma@gmail.com'),
('Srinivas', 'Rao', 'srinivas.rao@gmail.com'),
('Lakshmi', 'Priya', 'lakshmi.priya@gmail.com'),
('Ravi', 'Teja', 'ravi.teja@gmail.com'),
('Anjali', 'Devi', 'anjali.devi@gmail.com'),
('Kiran', 'Rao', 'kiran.rao@gmail.com'),
('Sowmya', 'Varma', 'sowmya.varma@gmail.com'),
('Mahesh', 'Babu', 'mahesh.babu@gmail.com'),
('Pavan', 'Kalyan', 'pavan.kalyan@gmail.com'),
('Harika', 'Chowdary', 'harika.chowdary@gmail.com');
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    message_from INT REFERENCES users (id),
    message_to INT REFERENCES users (id),
    message_content TEXT,
    is_media BOOLEAN DEFAULT false,
    deleted BOOLEAN DEFAULT FALSE,
    status BOOLEAN DEFAULT FALSE,
    send_at TIMESTAMP DEFAULT current_timestamp,
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);
CREATE TABLE IF NOT EXISTS mentions (
    id SERIAL PRIMARY KEY,
    message_id INT NOT NULL REFERENCES messages (id) ON DELETE CASCADE,
    mentioned_user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    mentioned_by INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS starred_messages(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    message_id INT NOT NULL REFERENCES messages (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);