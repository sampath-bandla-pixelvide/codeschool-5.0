-- Active: 1775629774720@@127.0.0.1@5432@test_2@public
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users 
ALTER COLUMN role SET DEFAULT 'user';

 INSERT INTO users (
    name,
    email,
    phone,
    password,
    role
)
VALUES (
    'Admin',
    'admin@gmail.com',
    9347075543,
    '$2y$12$KXr/FsF3SMY65oUsXJlEquzJf4q505aCvEA2kcjGWD0rYctiJufl6',
    'admin'
);  

CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id) ON DELETE CASCADE,
    token TEXT,
    otp VARCHAR(6),
    type VARCHAR(20), 
    is_valid BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER Table tokens ADD COLUMN is_used BOOLEAN DEFAULT false;

select * from tokens;
SELECT* from users;


CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    item_type VARCHAR(20), -- lost / found
    location VARCHAR(150),
    contact VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending', -- pending/approved/rejected
    is_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE item_images (
    id SERIAL PRIMARY KEY,
    item_id INT REFERENCES items(id) ON DELETE CASCADE,
    image_path TEXT
);

SELECT * FROM items;

select* from item_images;

CREATE TABLE claims (
    id SERIAL PRIMARY KEY,
    item_id INT REFERENCES items(id) ON DELETE CASCADE,
    claimer_id INT REFERENCES users(id) ON DELETE CASCADE,
    owner_id INT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
select* from claims;
