-- Active: 1775637690961@@127.0.0.1@5432@restaurant@public

CREATE TABLE restaurant (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location TEXT NOT NULL
);

CREATE TABLE customer (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE,
    email VARCHAR(100) UNIQUE
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id),
    restaurant_id INT NOT NULL REFERENCES restaurant(id)
);

CREATE TABLE staff_salary (
    id SERIAL PRIMARY KEY,
    staff_id INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    base_salary NUMERIC(10,2) NOT NULL CHECK (base_salary > 0),
    effective_from DATE NOT NULL
);

CREATE TABLE salary_payments (
    id SERIAL PRIMARY KEY,
    staff_id INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    salary_month DATE NOT NULL
        CHECK (date_trunc('month', salary_month) = salary_month),
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    payment_type VARCHAR(20) NOT NULL
        CHECK (payment_type IN ('salary','bonus','deduction')),
    payment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'paid'
        CHECK (status IN ('paid','pending')),

    UNIQUE(staff_id, salary_month, payment_type)
);

CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price NUMERIC(10,2) NOT NULL CHECK (price > 0)
);

CREATE TABLE chef_specialization (
    id SERIAL PRIMARY KEY,
    chef_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    skill_level VARCHAR(20)
        CHECK (skill_level IN ('junior','senior','master')),
);

CREATE TABLE restaurant_tables (
    id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    table_number INT NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),

    UNIQUE (restaurant_id, table_number)
);


CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
    restaurant_id INT NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    reservation_time TIMESTAMP NOT NULL,
    number_of_people INT NOT NULL CHECK (number_of_people > 0),
    status VARCHAR(20) DEFAULT 'booked'
        CHECK (status IN ('booked','cancelled','completed'))
);

CREATE TABLE reservation_tables (
    id SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    table_id INT NOT NULL REFERENCES restaurant_tables(id) ON DELETE CASCADE,

    UNIQUE(reservation_id, table_id)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    customer_id INT REFERENCES customer(id) ON DELETE SET NULL,
    table_id INT REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    waiter_id INT REFERENCES staff(id) ON DELETE SET NULL,
    reservation_id INT REFERENCES reservations(id) ON DELETE SET NULL,

    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending','served','cancelled')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        reservation_id IS NOT NULL OR table_id IS NOT NULL
    )
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT NOT NULL REFERENCES menu_items(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_time NUMERIC(10,2) NOT NULL CHECK (price_at_time > 0)
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    method VARCHAR(20)
        CHECK (method IN ('cash','card','upi')),
    status VARCHAR(20)
        CHECK (status IN ('pending','completed','failed')),
    paid_at TIMESTAMP
);


CREATE TABLE tips (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    total_tip NUMERIC(10,2) CHECK (total_tip >= 0)
);

CREATE TABLE tip_distribution (
    id SERIAL PRIMARY KEY,
    tip_id INT NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
    staff_id INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) CHECK (amount >= 0)
);



-- INSERT INTO 

INSERT INTO restaurant (name, location) VALUES
('Spice Hub', 'Hyderabad'),
('Food Palace', 'Bangalore');

INSERT INTO customer (name, phone, email) VALUES
('Rahul', '9876543210', 'rahul@gmail.com'),
('Anjali', '9123456780', 'anjali@gmail.com'),
('Kiran', '9988776655', 'kiran@gmail.com');

INSERT INTO roles (role_name) VALUES
('chef'),
('waiter'),
('manager');

INSERT INTO staff (name, role_id, restaurant_id) VALUES
('Ramesh', 1, 1), -- chef
('Suresh', 2, 1), -- waiter
('Mahesh', 3, 1), -- manager
('Arjun', 2, 2);  -- waiter

INSERT INTO staff_salary (staff_id, base_salary, effective_from) VALUES
(1, 30000, '2025-01-01'),
(2, 20000, '2025-01-01'),
(3, 40000, '2025-01-01');

INSERT INTO salary_payments (staff_id, salary_month, amount, payment_type, payment_date, status) VALUES
(1, '2026-03-01', 30000, 'salary', '2026-03-31', 'paid'),
(1, '2026-03-01', 5000, 'bonus', '2026-03-31', 'paid'),
(2, '2026-03-01', 20000, 'salary', '2026-03-31', 'paid'),
(3, '2026-03-01', 40000, 'salary', '2026-03-31', 'pending');

INSERT INTO menu_items (restaurant_id, name, category, price) VALUES
(1, 'Biryani', 'Main Course', 250),
(1, 'Paneer Curry', 'Main Course', 200),
(1, 'Ice Cream', 'Dessert', 100),
(2, 'Pizza', 'Main Course', 300);


INSERT INTO restaurant_tables (restaurant_id, table_number, capacity) VALUES
(1, 1, 4),
(1, 2, 6),
(1, 3, 2),
(2, 1, 4);


INSERT INTO reservations (customer_id, restaurant_id, reservation_time, number_of_people, status) VALUES
(1, 1, '2026-04-10 19:00:00', 4, 'booked'),
(2, 1, '2026-04-10 20:00:00', 2, 'booked');

INSERT INTO reservation_tables (reservation_id, table_id) VALUES
(1, 1),
(2, 3);

INSERT INTO orders (restaurant_id, customer_id, table_id, waiter_id, reservation_id, status)
VALUES
(1, 1, 1, 2, 1, 'served'),   -- reservation order
(1, 2, 2, 2, NULL, 'served'); -- walk-in


INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES
(1, 1, 2, 250), -- 2 biryani
(1, 3, 1, 100), -- ice cream
(2, 2, 1, 200), -- paneer
(2, 3, 2, 100); -- ice cream

INSERT INTO payments (order_id, amount, method, status, paid_at) VALUES
(1, 600, 'cash', 'completed', NOW()),

(2, 200, 'cash', 'completed', NOW()),
(2, 100, 'card', 'completed', NOW());

INSERT INTO tips (order_id, total_tip) VALUES
(1, 50),
(2, 30);

INSERT INTO tip_distribution (tip_id, staff_id, amount) VALUES
(1, 2, 50),
(2, 2, 30);

--  order_id | total_bill | total_paid | remaining

SELECT order_id, 
