-- Active: 1775629757833@@127.0.0.1@5432@demo@public
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(10) UNIQUE NOT NULL,
    pan VARCHAR(10) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SELECT*from users;

ALTER TABLE users
ADD COLUMN role VARCHAR(20) DEFAULT 'student'
CHECK (role IN ('admin', 'student'));

UPDATE users
SET role = 'admin'
WHERE email = 'nani@gmail.com';
CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expiry_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE user_tokens ADD COLUMN status BOOLEAN DEFAULT true;
SELECT*FROM user_tokens;
CREATE TABLE forgot_password_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    otp VARCHAR(6) NOT NULL,
    expiry_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SELECT*FROM forgot_password_tokens;

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO subjects (subject_name, icon) VALUES
('Maths', 'bi-calculator'),
('English', 'bi-book'),
('PHP', 'bi-filetype-php'),
('HTML', 'bi-filetype-html'),
('CSS', 'bi-filetype-css'),
('JavaScript', 'bi-filetype-js');

SELECT*FROM subjects;

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM questions;
CREATE TABLE attempts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    score INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SELECT * FROM attempts;
CREATE TABLE attempt_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer CHAR(1) NOT NULL CHECK (selected_answer IN ('A','B','C','D')),
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attempt_id, question_id)
);

SELECT * FROM attempt_answers;

SELECT*FROM questions;


ALTER TABLE attempts
ADD COLUMN started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE attempts
ADD COLUMN completed_at TIMESTAMP;

ALTER TABLE attempts
ADD COLUMN time_taken_seconds INT DEFAULT 0;

INSERT INTO questions 
(subject_id, question, option_a, option_b, option_c, option_d, correct_answer)
VALUES
((SELECT id FROM subjects WHERE subject_name='PHP'), 'What does PHP stand for?', 'Personal Home Page', 'Hypertext Preprocessor', 'Programming Home Page', 'Pre Hypertext Processor', 'B'),
((SELECT id FROM subjects WHERE subject_name='PHP'), 'Which symbol is used to declare a variable in PHP?', '@', '#', '$', '&', 'C'),
((SELECT id FROM subjects WHERE subject_name='PHP'), 'Which method is used to send form data securely?', 'GET', 'POST', 'PUT', 'FETCH', 'B'),
((SELECT id FROM subjects WHERE subject_name='PHP'), 'Which function is used to hash password in PHP?', 'password_hash()', 'md5_password()', 'hash_pass()', 'secure_hash()', 'A'),
((SELECT id FROM subjects WHERE subject_name='PHP'), 'Which superglobal stores POST data?', '$_GET', '$_POST', '$_SESSION', '$_COOKIE', 'B'),
((SELECT id FROM subjects WHERE subject_name='HTML'), 'What does HTML stand for?', 'Hyper Text Markup Language', 'High Text Machine Language', 'Hyper Tool Markup Language', 'Home Text Markup Language', 'A'),
((SELECT id FROM subjects WHERE subject_name='HTML'), 'Which tag is used for heading?', '<p>', '<h1>', '<div>', '<span>', 'B'),
((SELECT id FROM subjects WHERE subject_name='HTML'), 'Which tag is used to create a link?', '<a>', '<link>', '<href>', '<url>', 'A'),
((SELECT id FROM subjects WHERE subject_name='CSS'), 'What does CSS stand for?', 'Creative Style Sheet', 'Cascading Style Sheets', 'Computer Style Sheet', 'Color Style Sheet', 'B'),
((SELECT id FROM subjects WHERE subject_name='CSS'), 'Which property changes text color?', 'font-color', 'text-color', 'color', 'background', 'C'),
((SELECT id FROM subjects WHERE subject_name='JavaScript'), 'Which keyword declares a variable?', 'var', 'int', 'string', 'define', 'A'),
((SELECT id FROM subjects WHERE subject_name='JavaScript'), 'Which method prints output in console?', 'print()', 'console.log()', 'echo()', 'writeLog()', 'B');

SELECT q.id, s.subject_name, q.question, q.correct_answer
FROM questions q
JOIN subjects s ON s.id = q.subject_id
ORDER BY s.subject_name, q.id;

INSERT INTO questions
(subject_id, question, option_a, option_b, option_c, option_d, correct_answer)
VALUES

((SELECT id FROM subjects WHERE subject_name='Maths'), 'What is 5 + 7?', '10', '11', '12', '13', 'C'),
((SELECT id FROM subjects WHERE subject_name='Maths'), 'What is 9 × 6?', '45', '54', '56', '64', 'B'),
((SELECT id FROM subjects WHERE subject_name='Maths'), 'What is 100 ÷ 4?', '20', '25', '30', '40', 'B'),
((SELECT id FROM subjects WHERE subject_name='Maths'), 'What is the square of 8?', '16', '32', '64', '81', 'C'),
((SELECT id FROM subjects WHERE subject_name='Maths'), 'What is 15 - 9?', '5', '6', '7', '8', 'B'),
((SELECT id FROM subjects WHERE subject_name='Maths'), 'What is the value of 2³?', '6', '8', '9', '12', 'B'),
((SELECT id FROM subjects WHERE subject_name='Maths'), 'What is 50% of 200?', '50', '75', '100', '150', 'C'),
((SELECT id FROM subjects WHERE subject_name='Maths'), 'What is 12 + 18?', '20', '25', '30', '35', 'C'),
((SELECT id FROM subjects WHERE subject_name='Maths'), 'What is 7²?', '14', '21', '42', '49', 'D'),
((SELECT id FROM subjects WHERE subject_name='Maths'), 'What is 81 ÷ 9?', '7', '8', '9', '10', 'C'),


((SELECT id FROM subjects WHERE subject_name='English'), 'Choose the correct spelling.', 'Recieve', 'Receive', 'Receeve', 'Recive', 'B'),
((SELECT id FROM subjects WHERE subject_name='English'), 'What is the synonym of happy?', 'Sad', 'Angry', 'Joyful', 'Tired', 'C'),
((SELECT id FROM subjects WHERE subject_name='English'), 'What is the opposite of hot?', 'Warm', 'Cold', 'Heat', 'Fire', 'B'),
((SELECT id FROM subjects WHERE subject_name='English'), 'Choose the correct article: ___ apple.', 'A', 'An', 'The', 'No article', 'B'),
((SELECT id FROM subjects WHERE subject_name='English'), 'Which is a noun?', 'Run', 'Beautiful', 'School', 'Quickly', 'C'),
((SELECT id FROM subjects WHERE subject_name='English'), 'Which is a verb?', 'Eat', 'Blue', 'Chair', 'Soft', 'A'),
((SELECT id FROM subjects WHERE subject_name='English'), 'Choose the correct sentence.', 'He go to school.', 'He goes to school.', 'He going school.', 'He gone school.', 'B'),
((SELECT id FROM subjects WHERE subject_name='English'), 'What is the plural of child?', 'Childs', 'Children', 'Childes', 'Childrens', 'B'),
((SELECT id FROM subjects WHERE subject_name='English'), 'What is the past tense of write?', 'Writed', 'Written', 'Wrote', 'Writing', 'C'),
((SELECT id FROM subjects WHERE subject_name='English'), 'Which word is an adjective?', 'Beautiful', 'Run', 'Table', 'Quickly', 'A');