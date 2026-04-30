-- Active: 1775629774720@@127.0.0.1@5432@instagram_management@public
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    username VARCHAR(50) UNIQUE, 
    password TEXT NOT NULL,
    fullname VARCHAR(100),
    dob DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE users ADD profile_pic VARCHAR(255);

select * from users;

DELETE from users where id = 11;

CREATE TABLE otp_verifications (
    id SERIAL PRIMARY KEY,
    contact VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE temp_users (
    id SERIAl PRIMARY KEY,
    contact VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(15),
    username VARCHAR(50),
    password VARCHAR(255),
    fullname VARCHAR(100),
    dob DATE
);

select * from otp_verifications;

select * from temp_users;

delete from temp_users where id = 23;

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from posts
order by id;

CREATE TABLE saved_posts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);
select* from saved_posts;

CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);

select* from likes;