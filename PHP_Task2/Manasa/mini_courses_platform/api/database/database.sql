CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(12),
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select* from users;
ALTER TABLE users
ADD COLUMN token text; 
alter table users
drop column token;

CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select role from users;


delete from users
where id='4';
INSERT INTO users (name, email, phone, password, role)
VALUES (
  'Admin',
  'admin@gmail.com',
  '9999999999',
  '$2y$12$85QEIkwoaFAcgnTSIEQyROMB8EKeVMhvpAOLY3x6/S3oSfdbPK4rS',
  'admin'
);

select email, role 
from users;

select* from tokens;

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE courses 
ADD COLUMN price INT DEFAULT 0;


INSERT INTO courses (title, description, price, created_by)
VALUES 
('Web Development', 'Learn HTML, CSS, JavaScript from scratch', 999, 1),

('Python Basics', 'Beginner to advanced Python programming', 799, 1),

('UI/UX Design', 'Design modern user interfaces and experiences', 899, 1),

('Data Structures', 'Master DSA for interviews and problem solving', 1099, 1),

('React JS', 'Build dynamic web apps using React', 1199, 1);

select* from courses;
delete from courses
where id=11;



CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT,
   img_url TEXT,
    lesson_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE lessons DROP COLUMN img_url;

select* from lessons;
delete from lessons 
where id=23;

CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INT,
    course_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);
select* from enrollments;
delete from enrollments
where id=8;
delete from enrollments
where id=5;

delete from courses
where id =8;
select* from courses;

select* from lessons;

CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'completed',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, lesson_id)
);
select* from lesson_progress;

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, course_id)
);

select* from reviews;

ALTER TABLE courses 
ADD COLUMN requires_approval BOOLEAN DEFAULT false;


create table settings(
    id serial PRIMARY KEY,
    required_approval_global BOOLEAN DEFAULT false
);

alter Table settings
RENAME column required_approval_global to require_approval_global;

INSERT INTO settings (require_approval_global) VALUES (false);

CREATE TABLE enrollment_requests (
    id SERIAL PRIMARY KEY,
    user_id INT,
    course_id INT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE enrollment_requests 
ADD CONSTRAINT unique_request UNIQUE (user_id, course_id);