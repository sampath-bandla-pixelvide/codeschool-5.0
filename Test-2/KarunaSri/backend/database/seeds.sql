


CREATE TABLE exits (
    id SERIAL PRIMARY KEY,

    exit_name VARCHAR(100) NOT NULL UNIQUE,

    location VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO exits (exit_name, location)
VALUES
('Exit 1', 'Gachibowli'),
('Exit 2', 'Kokapet'),
('Exit 3', 'Patancheru'),
('Exit 4', 'Shamshabad'),
('Exit 5', 'Medchal'),
('Exit 6', 'LB Nagar'),
('Exit 7', 'Uppal'),
('Exit 8', 'Kompally');

--  admin

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (
    name,
    email,
    password,
    role
)
VALUES (
    'Admin',
    'admin@gmail.com',
     crypt('password@123', gen_salt('bf')),
    'admin'
);

$2y$12$vIU3wu31ScehgyN5w6E1DupuK19QNtB1xWHwyR8qj2IzQTl1tBGQy

-- employees
INSERT INTO users (
    name,
    email,
    password,
    role,
    assigned_exit_id
)
VALUES 
('Raj','raj@gmail.com', crypt('password@123', gen_salt('bf')),'employee', 1 ),

('Sneha Reddy', 'sneha@gmail.com',  crypt('password@123', gen_salt('bf')), 'employee', 2),

('Arjun Patel', 'arjun@gmail.com',  crypt('password@123', gen_salt('bf')), 'employee', 3),

('Meena Sharma', 'meena@gmail.com',  crypt('password@123', gen_salt('bf')), 'employee', 4),

('Kiran Rao', 'kiran@gmail.com',  crypt('password@123', gen_salt('bf')), 'employee', 5),

('Vikram Singh', 'vikram@gmail.com',  crypt('password@123', gen_salt('bf')), 'employee', 6);


INSERT INTO toll_rates (
    entry_exit_id,
    destination_exit_id,
    amount
)
VALUES
-- Exit 1 routes
(1, 2, 50),
(1, 3, 100),
(1, 4, 150),
(1, 5, 220),
(1, 6, 300),

-- Exit 2 routes
(2, 3, 60),
(2, 4, 120),
(2, 5, 180),
(2, 6, 250),

-- Exit 3 routes
(3, 4, 70),
(3, 5, 140),
(3, 6, 210),

-- Exit 4 routes
(4, 5, 80),
(4, 6, 150),

-- Exit 5 routes
(5, 6, 90),

-- Reverse routes
(6, 5, 90),
(6, 4, 150),
(6, 3, 210),
(6, 2, 250),
(6, 1, 300),

(5, 4, 80),
(5, 3, 140),
(5, 2, 180),
(5, 1, 220),

(4, 3, 70),
(4, 2, 120),
(4, 1, 150);


INSERT INTO trips (
    token_number,
    vehicle_number,
    entry_exit_id,
    entry_time,
    status,
    payment_status,
    created_by_employee_id
)
VALUES

(
    'ORR-20260520-A1B2C3',
    'TS09AB1234',
    1,
    CURRENT_TIMESTAMP - INTERVAL '45 minutes',
    'active',
    'pending',
    3
),

(
    'ORR-20260520-X8Y7Z6',
    'AP28CD5678',
    2,
    CURRENT_TIMESTAMP - INTERVAL '20 minutes',
    'active',
    'pending',
    4
),

(
    'ORR-20260520-Q1W2E3',
    'TS10EF9999',
    3,
    CURRENT_TIMESTAMP - INTERVAL '10 minutes',
    'active',
    'pending',
    5
);



SELECT * FROM users;


SELECT * FROM trips;



    