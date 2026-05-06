-- Active: 1775629720989@@127.0.0.1@5432@store@public
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE,
    mobile VARCHAR(20) UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM users;

SELECT id, user_id FROM posts;

ALTER TABLE users ADD COLUMN otp VARCHAR(10);

ALTER TABLE users ADD COLUMN otp_expiry TIMESTAMP;

SELECT email, mobile, otp, otp_expiry FROM users;

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    text TEXT,
    file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE posts ADD COLUMN status BOOLEAN NOT NULL DEFAULT TRUE;
SELECT * FROM posts WHERE status = TRUE ORDER BY id DESC;
SELECT * FROM posts 
WHERE status = TRUE 
ORDER BY id DESC;

SELECT * FROM posts;

DELETE FROM posts WHERE file='';

ALTER TABLE users ADD COLUMN profile_pic VARCHAR(255);

UPDATE users
SET
    profile_pic = '/Images/profile.png'
WHERE
    profile_pic IS NULL;

UPDATE users SET profile_pic = REPLACE(profile_pic, 'Images/', '');

SELECT profile_pic FROM users;

CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL
);

DROP TABLE likes;

SELECT * FROM likes;

CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    CONSTRAINT fk_post FOREIGN KEY (post_id) 
        REFERENCES posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) 
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT unique_like UNIQUE (post_id, user_id)
);
ALTER TABLE likes
ADD CONSTRAINT unique_like UNIQUE (post_id, user_id);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INT,
    user_id INT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DROP TABLE comments;
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL REFERENCES posts(id),
    user_id INT NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DELETE FROM comments WHERE user_id=6;
SELECT * FROM comments;
DELETE FROM likes
WHERE
    id NOT IN (
        SELECT MIN(id)
        FROM likes
        GROUP BY
            post_id,
            user_id
    );

SELECT post_id, user_id FROM likes ORDER BY post_id;