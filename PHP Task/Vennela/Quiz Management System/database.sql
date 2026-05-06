-- Active: 1775629720989@@127.0.0.1@5432@quiz@public
CREATE DATABASE quiz;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO
    users (name, email, password)
VALUES (
        'Vennela',
        'vennela@gmail.com',
        '123456'
    ),
    (
        'Rahul',
        'rahul@gmail.com',
        '123456'
    ),
    (
        'Anjali',
        'anjali@gmail.com',
        '123456'
    ),
    (
        'Kiran',
        'kiran@gmail.com',
        '123456'
    ),
    (
        'Sneha',
        'sneha@gmail.com',
        '123456'
    );

SELECT * FROM users;

UPDATE users SET role = 'admin' WHERE id = 1;

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'inactive')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subject_id INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 10,
    total_marks INTEGER DEFAULT 0,
    created_by INTEGER,
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'inactive')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
    CONSTRAINT fk_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    quiz_id INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    MN status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'completed')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
);

ALTER TABLE attempts ADD COLUMN submitted_at TIMESTAMP;

SELECT * FROM attempts;

SELECT * FROM quizzes;

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    marks INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'inactive')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_question FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
);

DELETE FROM attempts WHERE user_id IN (1, 5);

CREATE TABLE options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'inactive')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_question_option FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
);

CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    selected_option INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN (
            'active',
            'skipped',
            'deleted'
        )
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_answer_attempt FOREIGN KEY (attempt_id) REFERENCES attempts (id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_option FOREIGN KEY (selected_option) REFERENCES options (id) ON DELETE CASCADE
);

ALTER TABLE attempts ADD COLUMN total INTEGER DEFAULT 0;

ALTER TABLE attempts
ADD CONSTRAINT unique_user_quiz UNIQUE (user_id, quiz_id);

SELECT user_id, quiz_id, COUNT(*)
FROM attempts
GROUP BY
    user_id,
    quiz_id
HAVING
    COUNT(*) > 1;

DELETE FROM attempts
WHERE
    id NOT IN (
        SELECT MAX(id)
        FROM attempts
        GROUP BY
            user_id,
            quiz_id
    );

SELECT id, option_text, is_correct
FROM options
WHERE
    question_id =:qid
    AND status = 'active';

SELECT * FROM attempts;
CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    status BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
drop table user_tokens;
SELECT * FROM subjects;
