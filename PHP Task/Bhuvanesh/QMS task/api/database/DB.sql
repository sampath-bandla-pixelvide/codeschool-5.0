-- Active: 1776361631720@@127.0.0.1@5432@qms@public

create table users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


insert into users (name,email,password) values ('bhuvanesh','bhuvanesh@gmail.com',md5('1255Vb@'));
insert into users (name,email,password) values ('bhuvanesh12','bhuvi@gmail.com',md5('1255Vb@1'));




alter table users add column is_active BOOLEAN default true;

insert into users (name , email, password) values ('holly','whatever@gmail.com',md5('5555bc@P'));

create table roles (
    id serial PRIMARY KEY,
    role VARCHAR(100) NOT NULL UNIQUE 
)

insert into roles (role) values('admin'),('user');

alter table users add column role_id INt REFERENCES roles(id);


ALTER TABLE users ALTER COLUMN role_id SET default 2;


update users set role_id = 1 where id = 1;

update users set role_id = 2 where id !=1

alter table users alter column role_id set not null;

create table subjects(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO subjects (name) VALUES
('html'),
('css'),
('javaScript');



create table quizzes(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject_id INT NOT NULL REFERENCES subjects(id) on delete cascade,
    duration_minutes INT NOT NULL,
    total_marks INT NOT NULL,
    created_by INT REFERENCES users(id) on delete cascade,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



create table questions(
    id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL REFERENCES quizzes(id) on delete cascade,
    question_text TEXT NOT NULL,
    marks INT DEFAULT 1
   
);

create table options(
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES questions(id) on delete cascade,
    option_text VARCHAR(255) NOT NULL,
    is_correct BOOLEAN DEFAULT false
);

create table attempts(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) on delete cascade,
    quiz_id INT NOT NULL REFERENCES quizzes(id) on delete cascade,
    obtained_marks INT NOT NULL,
    total_marks INT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    is_completed BOOLEAN
);

create table answers(
    id SERIAL PRIMARY KEY,
    attempt_id INT NOT NULL REFERENCES attempts(id) on delete cascade,
    question_id INT NOT NULL REFERENCES questions(id) on delete cascade,
    option_id INT NOT NULL REFERENCES options(id)
);

CREATE TABLE user_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active boolean NOt NULL default true
);



