-- Active: 1775629728003@@127.0.0.1@5432@restaurant@public
CREATE Table customer (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    email VARCHAR(30) UNIQUE NOT NULL,
    phone_number VARCHAR(10) UNIQUE NOT NULL
);


CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (
        role IN ('Manager', 'Chef', 'Waiter')
    ),
    joined_date DATE DEFAULT current_date
);


CREATE TABLE address (
    address_id SERIAL PRIMARY KEY,
    address VARCHAR(100)
    city VARCHAR(25) NOT NULL,
    state VARCHAR(25) NOT NULL,
    country VARCHAR(20) NOT NULL,
    zip_code CHAR(6) NOT NULL,
);


CREATE TABLE restaurant (
    restaurant_id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    manager_id INT REFERENCES staff (staff_id),
    address_id INT REFERENCES address (address_id)
);

CREATE TABLE item (
    item_id SERIAL PRIMARY KEY,
    name VARCHAR(25) NOT NULL,
    cuisine VARCHAR(25) NOT NULL,
    chef_id INT REFERENCES staff (staff_id),
);


CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    quantity INT DEFAULT 1,
    ordered_at TIMESTAMP DEFAULT current_timestamp
);

ALTER TABLE orders
ADD COLUMN table_id INT REFERENCES dinning_space (table_id);

CREATE TABLE item_orders(
    item_id INT REFERENCES item(item_id),
    order_id INT REFERENCES orders(order_id)
);

CREATE TABLE customer_orders (
    customer_id INT NOT NULL REFERENCES customer (customer_id),
    order_id INT NOT NULL REFERENCES orders (order_id)
);

CREATE TABLE dinning_space (
    table_id SERIAL PRIMARY KEY,
    table_number INT NOT NULL,
    waiter_id INT NOT NULL REFERENCES staff (staff_id)
);

CREATE TABLE payment (
    payment_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customer (customer_id),
    order_id INT REFERENCES orders (order_id),
    amount NUMERIC(10, 2) NOT NULL,
    tip_amount INT DEFAULT 0,
    payment_type VARCHAR(15) CHECK (
        payment_type IN ('UPI', 'CARD', 'SPLIT')
    )
);

CREATE TABLE salary_details (
    salary_id SERIAL PRIMARY KEY,
    staff_id INT REFERENCES staff (staff_id),
    salary INT DEFAULT 10000,
    account_number VARCHAR(20) UNIQUE NOT NULL
);

