
-- USERS TABLE

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    dob DATE,
    gender VARCHAR(10),
    avatar_color VARCHAR(20) DEFAULT '#1a73e8',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- USER TOKENS TABLE

CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE
);


select * from user_tokens;

-- LABELS TABLE

CREATE TABLE labels (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#cccccc',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

select * from labels;


-- EMAILS TABLE

CREATE TABLE emails (
    id SERIAL PRIMARY KEY,
    thread_id VARCHAR(100) NOT NULL,
    sender_id INT REFERENCES users(id) ON DELETE SET NULL,
    sender_email VARCHAR(150) NOT NULL,
    sender_name VARCHAR(200),
    subject VARCHAR(500),
    body TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

select * from emails;

-- EMAIL RECIPIENTS TABLE

CREATE TABLE email_recipients (
    id SERIAL PRIMARY KEY,
    email_id INT REFERENCES emails(id) ON DELETE CASCADE,
    recipient_email VARCHAR(150) NOT NULL,
    recipient_name VARCHAR(100),
    type VARCHAR(10) DEFAULT 'to' CHECK (type IN ('to', 'cc', 'bcc'))
);

select * from email_recipients;


CREATE TABLE user_emails (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    email_id INT REFERENCES emails(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_spam BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT FALSE,
    label_id INT REFERENCES labels(id) ON DELETE SET NULL,
    folder VARCHAR(50) DEFAULT 'inbox',
    created_at TIMESTAMP DEFAULT NOW()
);

select * from user_emails;

CREATE TABLE user_otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

select * from user_otps;

SELECT id, email, otp, is_used, expires_at 
FROM user_otps 
ORDER BY id DESC;

