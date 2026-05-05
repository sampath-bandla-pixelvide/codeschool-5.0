-- Active: 1775629937179@@127.0.0.1@5432@temp@public

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(200),
    phone VARCHAR(10),
    password VARCHAR(50)
);

CREATE TABLE user_addresses (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),

  address_line TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from user_addresses;


CREATE TYPE user_role AS ENUM ('admin', 'user');

ALTER TABLE users ADD COLUMN role user_role DEFAULT 'user';

UPDATE users SET role = 'admin' WHERE id = 1;

UPDATE users SET role = 'admin' WHERE id = 5;

SELECT * FROM users ORDER BY id;

CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(10) UNIQUE,
    user_id INT REFERENCES users (id),
    expiry_timestamp TIMESTAMP,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM user_tokens;

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    stock INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL
);

ALTER TABLE products ADD image VARCHAR(255) NULL;

UPDATE products SET image = 'uploads/products/blue-jeans.jpg' WHERE id =  2;

SELECT * FROM products ORDER BY id;

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id),
    total_amount DECIMAL(10, 2) DEFAULT 0,
    order_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE orders
ALTER COLUMN order_status
SET DEFAULT 'processing';

UPDATE orders
SET
    order_status = 'processing'
WHERE
    order_status = 'pending';

SELECT * FROM orders;  

ALTER TABLE orders 
ADD COLUMN address_id INT REFERENCES user_addresses(id),
ADD COLUMN payment_method VARCHAR(50);

CREATE TABLE ordered_products (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders (id),
    product_id INT REFERENCES products (id),
    quantity INT DEFAULT 1,
    price NUMERIC(10, 2)
);

SELECT * FROM ordered_products;




