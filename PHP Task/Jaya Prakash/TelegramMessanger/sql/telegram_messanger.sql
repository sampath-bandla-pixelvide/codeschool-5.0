-- Active: 1775629728003@@127.0.0.1@5432@telegram_messanger@public
create Table users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(30),
    username VARCHAR(50) UNIQUE,
    bio VARCHAR(150),
    phone_number VARCHAR(10) NOT NULL UNIQUE check (length(phone_number) = 10),
    photo TEXT,
    email VARCHAR(50) UNIQUE,
    is_online BOOLEAN DEFAULT False,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * from users;

CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(10),
    otp VARCHAR(225),
    otp_expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '5 minutes'
);

ALTER TABLE otps ADD COLUMN status BOOLEAN DEFAULT TRUE;

ALTER TABLE otps
ADD COLUMN updated_at TIMESTAMP DEFAULT current_timestamp;

UPDATE otps SET status = FALSE WHERE 1 = 1;

select * from otps;

select * from users where username ILIKE 'n%';

CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id),
    token VARCHAR(20) UNIQUE NOT NULL,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 hours',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_tokens ADD COLUMN status BOOLEAN DEFAULT TRUE;

SELECT * from user_tokens;

DELETE FROM user_tokens;

DELETE FROM users;

CREATE TABLE user_contacts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id) NOT NULL,
    friend_id INT REFERENCES users (id) NOT NULL check (user_id != friend_id),
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

SELECT * FROM user_contacts;

ALTER TABLE user_contacts ADD COLUMN status BOOLEAN DEFAULT TRUE;

SELECT *
FROM users u
    LEFT JOIN user_contacts uc ON uc.friend_id = u.id
    AND uc.user_id = 5;

SELECT username, photo, u.is_online
FROM user_contacts uc
    inner join users u ON uc.friend_id = u.id
where
    uc.user_id = 5;

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    message_from INT REFERENCES users (id),
    message_to INT REFERENCES users (id),
    message_content TEXT,
    is_media BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    status BOOLEAN DEFAULT FALSE,
    send_at TIMESTAMP DEFAULT current_timestamp,
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

INSERT INTO
    messages (
        message_from,
        message_to,
        message_content,
        send_at
    )
VALUES (
        5,
        7,
        'movie podham!!',
        current_timestamp - INTERVAL '4 days'
    );

UPDATE messages SET status = TRUE WHERE 1 = 1;

SELECT * FROM messages;

CREATE TABLE user_friend_request_notifications (
    id SERIAL PRIMARY KEY,
    from_user INT REFERENCES users (id) NOT NULL,
    to_user INT REFERENCES users (id) NOT NULL,
    status VARCHAR(10) DEFAULT 'PENDING' check (
        status in (
            'ACCEPTED',
            'REJECTED',
            'PENDING'
        )
    ),
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

SELECT * FROM user_friend_request_notifications;

SELECT *
from
    user_friend_request_notifications ufrn
    INNER JOIN users u ON ufrn.from_user = u.id
WHERE
    to_user = '5'
    and ufrn.status = 'PENDING';

SELECT
    photo,
    first_name,
    last_name,
    username,
    email,
    bio
FROM user_tokens ut
    INNER JOIN users u ON ut.user_id = u.id
WHERE
    status = true;



-- CREATE TABLE groups (
--     id SERIAL PRIMARY KEY,
--     group_name VARCHAR(30) NOT NULL,
--     group_image VARCHAR(225),
--     admin_id INT NOT NULL REFERENCES users (id),
--     status BOOLEAN DEFAULT TRUE,
--     members_count INT DEFAULT 1 check (members_count > 0),
--     created_at TIMESTAMP DEFAULT current_timestamp,
--     updated_at TIMESTAMP DEFAULT current_timestamp
-- );

-- SELECT * FROM groups ORDER BY created_at DESC;

-- CREATE TABLE group_members (
--     id SERIAL PRIMARY KEY,
--     group_id INT NOT NULL REFERENCES groups (id),
--     member_id INT NOT NULL REFERENCES users (id),
--     status BOOLEAN DEFAULT TRUE,
--     joined_at TIMESTAMP DEFAULT current_timestamp,
--     created_at TIMESTAMP DEFAULT current_timestamp,
--     updated_at TIMESTAMP DEFAULT current_timestamp
-- );

-- CREATE TABLE group_messages (
--     id SERIAL PRIMARY KEY,
--     group_id INT NOT NULL REFERENCES groups(id),
--     group_member_id INT NOT NULL REFERENCES users (id),
--     message TEXT,
--     is_media BOOLEAN DEFAULT FALSE,
--     status BOOLEAN DEFAULT TRUE,
--     send_at TIMESTAMP DEFAULT current_timestamp,
--     created_at TIMESTAMP DEFAULT current_timestamp,
--     updated_at TIMESTAMP DEFAULT current_timestamp
-- );