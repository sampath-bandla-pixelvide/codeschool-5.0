-- Active: 1700474726424@@127.0.0.1@5432@orr_toll_system@public

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) ,

    email VARCHAR(150) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('admin', 'employee')),

    assigned_exit_id INT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM users;

CREATE TABLE exits (
    id SERIAL PRIMARY KEY,

    exit_name VARCHAR(100) NOT NULL UNIQUE,

    location VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE users
ADD CONSTRAINT fk_users_exit
FOREIGN KEY (assigned_exit_id)
REFERENCES exits(id)
ON DELETE SET NULL;


CREATE TABLE toll_rates (
    id SERIAL PRIMARY KEY,

    entry_exit_id INT NOT NULL,

    destination_exit_id INT NOT NULL,

    amount NUMERIC(10,2) NOT NULL
        CHECK (amount >= 0),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_entry_exit
        FOREIGN KEY (entry_exit_id)
        REFERENCES exits(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_destination_exit
        FOREIGN KEY (destination_exit_id)
        REFERENCES exits(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_route
        UNIQUE(entry_exit_id, destination_exit_id),

    CONSTRAINT no_same_exit
        CHECK (entry_exit_id <> destination_exit_id)
);


CREATE TABLE trips (
    id SERIAL PRIMARY KEY,

    token_number VARCHAR(50) UNIQUE NOT NULL,

    vehicle_number VARCHAR(30) NOT NULL,

    entry_exit_id INT NOT NULL,

    exit_exit_id INT NULL,

    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    exit_time TIMESTAMP NULL,

    amount NUMERIC(10,2) DEFAULT 0,

    payment_status VARCHAR(20) DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'paid')),

    payment_method VARCHAR(20) NULL
        CHECK (payment_method IN ('cash', 'card', 'upi')),

    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'completed')),

    created_by_employee_id INT NOT NULL,

    closed_by_employee_id INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_trip_entry_exit
        FOREIGN KEY (entry_exit_id)
        REFERENCES exits(id),

    CONSTRAINT fk_trip_exit_exit
        FOREIGN KEY (exit_exit_id)
        REFERENCES exits(id),

    CONSTRAINT fk_created_employee
        FOREIGN KEY (created_by_employee_id)
        REFERENCES users(id),

    CONSTRAINT fk_closed_employee
        FOREIGN KEY (closed_by_employee_id)
        REFERENCES users(id)
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,

    trip_id INT NOT NULL UNIQUE,

    amount NUMERIC(10,2) NOT NULL,

    payment_method VARCHAR(20) NOT NULL
        CHECK (payment_method IN ('cash', 'card', 'upi')),

    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    collected_by_employee_id INT NOT NULL,

    CONSTRAINT fk_payment_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_payment_employee
        FOREIGN KEY (collected_by_employee_id)
        REFERENCES users(id)
);

CREATE TABLE penalties (
    id SERIAL PRIMARY KEY,

    trip_id INT NOT NULL,

    penalty_amount NUMERIC(10,2) NOT NULL,

    reason TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_penalty_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX unique_active_vehicle
ON trips(vehicle_number)
WHERE status = 'active';

CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(10) UNIQUE,
    user_id INT REFERENCES users(id),
    expiry_timestamp TIMESTAMP,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


SELECT * FROM exits;

SELECT * FROM toll_rates;



