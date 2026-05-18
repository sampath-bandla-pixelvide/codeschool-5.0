-- Active: 1775629937179@@127.0.0.1@5432@postgres@public
create Table users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(30),
  phone_number VARCHAR(10) NOT NULL UNIQUE check (length(phone_number) = 10),
  email VARCHAR(50) UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(10) DEFAULT 'user',
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


UPDATE users SET role = 'admin' WHERE id = 3;

SELECT * FROM users;



CREATE TABLE user_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users (id),
  token VARCHAR(20) UNIQUE NOT NULL,
  expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 day',
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM user_tokens;

CREATE TABLE polls(
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM polls;

CREATE TABLE poll_options (
  id SERIAL PRIMARY KEY,
  poll_id INT REFERENCES polls(id),
  option_text VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM poll_options;

CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  poll_id INT REFERENCES polls(id),
  option_id INT REFERENCES poll_options(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM votes;

