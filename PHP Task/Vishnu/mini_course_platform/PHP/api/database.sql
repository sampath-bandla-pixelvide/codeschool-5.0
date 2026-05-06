-- Active: 1775629723302@@127.0.0.1@5432@mini_course@public
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'student')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    admin_id INT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price INT DEFAULT 1000
);

CREATE TABLE lessons (
    lesson_id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    lesson_order INT NOT NULL
);

CREATE TABLE enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_enrollment UNIQUE (user_id, course_id)
);

CREATE TABLE enrollment_settings (
    setting_id SERIAL PRIMARY KEY,
    admin_id INT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    course_id INT DEFAULT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
    auto_enroll BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_setting UNIQUE (admin_id, course_id)
);

CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_rating UNIQUE (user_id, course_id)
);

CREATE TABLE lesson_progress (
    progress_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    lesson_id INT NOT NULL REFERENCES lessons (lesson_id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    CONSTRAINT unique_progress UNIQUE (user_id, lesson_id)
);

ALTER TABLE lesson_progress ADD COLUMN course_id INT;

UPDATE lesson_progress lp
SET
    course_id = l.course_id
FROM lessons l
WHERE
    lp.lesson_id = l.lesson_id;

ALTER TABLE lesson_progress ALTER COLUMN course_id SET NOT NULL;

ALTER TABLE lesson_progress
ADD CONSTRAINT fk_user_course FOREIGN KEY (user_id, course_id) REFERENCES enrollments (user_id, course_id) ON DELETE CASCADE;

SELECT * FROM users;

SELECT * FROM courses;

SELECT * FROM lessons;

SELECT * FROM enrollment_settings;

SELECT * FROM lesson_progress;

SELECT * FROM ratings;

SELECT * FROM enrollment_settings;

ALTER TABLE enrollments ADD COLUMN status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));

