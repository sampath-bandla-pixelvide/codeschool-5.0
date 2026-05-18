-- Active: 1778134682979@@127.0.0.1@5432@auth@public

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

ALTER TABLE users ADD COLUMN role VARCHAR(10) DEFAULT 'user';

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



SELECT * FROM otps;


SELECT * FROM users;

SELECT * FROM user_tokens;
DELETE from users where role='admin';
INSERT INTO
    users (
        first_name,
        last_name,
        phone_number,
        email,
        password,
        role
    )
VALUES (
        'admin',
        'admin',
        '0000000000',
        'admin@gmail.com',
        md5('admin@123'),
        'admin'
    );
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin1@gmail.com';
CREATE TABLE recipes (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(150) NOT NULL,
    description TEXT,
    ingredients  TEXT NOT NULL,
    steps TEXT,
    status      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipe_images (
    id SERIAL PRIMARY KEY,
    recipe_id   INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    image_path  TEXT NOT NULL,
    source_type VARCHAR(10) DEFAULT 'upload'
                CHECK (source_type IN ('upload','url')),
    status      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE TABLE recipe_ingredients (
--     id SERIAL PRIMARY KEY,
--     recipe_id   INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
--     ingredient  TEXT NOT NULL,
--     status      BOOLEAN DEFAULT TRUE,
--     created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

CREATE TABLE wishlist (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id   INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    status      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);

SELECT COUNT(*) AS total_images
FROM recipe_images
WHERE recipe_id = 2;

select * from recipes;
DELETE FROM recipes
WHERE id IN (5, 6);