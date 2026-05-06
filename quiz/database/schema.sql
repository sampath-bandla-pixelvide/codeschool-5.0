-- Active: 1777487928208@@127.0.0.1@5432@quiz@public

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    role VARCHAR DEFAULT 'user',
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from users;
update users set role='admin' where id=3;

CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    status BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SUBJECTS
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QUIZZES
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    subject_id INT REFERENCES subjects(id),
    duration_minutes INT NOT NULL,
    created_by INT REFERENCES users(id),
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QUESTIONS
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    marks INT NOT NULL,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OPTIONS
CREATE TABLE options (
    id SERIAL PRIMARY KEY,
    question_id INT REFERENCES questions(id) ON DELETE CASCADE,
    option_text VARCHAR NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE options ADD COLUMN status BOOLEAN DEFAULT true;

-- ATTEMPTS
CREATE TABLE attempts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    quiz_id INT REFERENCES quizzes(id),
    obtained_marks INT DEFAULT 0,
    total_marks INT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quiz_id)
);

SELECT conname
FROM pg_constraint
WHERE conrelid = 'attempts'::regclass;

ALTER TABLE attempts
DROP CONSTRAINT 
attempts_user_id_quiz_id_key;



-- ANSWERS
CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    attempt_id INT REFERENCES attempts(id) ON DELETE CASCADE,
    question_id INT REFERENCES questions(id),
    option_id INT REFERENCES options(id),
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

 INSERT INTO subjects (name)
VALUES 
    ('Mathematics'),
    ('Physics'),
    ('Chemistry'),
    ('Biology'),
    ('Computer Science');

select * from subjects;



select * from quizzes;

INSERT INTO quizzes (title, subject_id, duration_minutes, created_by)
VALUES

('Math Quiz 1', 3, 30, 1),
('Math Quiz 2', 3, 30, 1),
('Math Quiz 3', 3, 30, 1),

('Physics Quiz 1', 4, 30, 1),
('Physics Quiz 2', 4, 30, 1),
('Physics Quiz 3', 4, 30, 1),

('Chemistry Quiz 1', 5, 30, 1),
('Chemistry Quiz 2', 5, 30, 1),
('Chemistry Quiz 3', 5, 30, 1),

('Biology Quiz 1', 6, 30, 1),
('Biology Quiz 2', 6, 30, 1),
('Biology Quiz 3', 6, 30, 1),


('CS Quiz 1', 7, 30, 1),
('CS Quiz 2', 7, 30, 1),
('CS Quiz 3', 7, 30, 1);
select * from quizzes;
update quizzes set duration_minutes=1 where id between 8 and 22;

INSERT INTO questions (quiz_id, question_text, marks) VALUES


(23, 'What is 2 + 2?', 1),
(23, 'What is 5 × 3?', 1),
(23, 'What is 10 - 6?', 1),


(24, 'What is 12 / 4?', 1),
(24, 'What is square of 5?', 1),
(24, 'What is 9 + 8?', 1),


(25, 'What is cube of 2?', 1),
(25, 'What is 15 - 7?', 1),
(25, 'What is 6 × 6?', 1),


(26, 'Unit of force?', 1),
(26, 'Who discovered gravity?', 1),
(26, 'Speed = ?', 1),


(27, 'Unit of energy?', 1),
(27, 'What is acceleration?', 1),
(27, 'SI unit of mass?', 1),


(28, 'What is H2O?', 1),
(28, 'Atomic number of Oxygen?', 1),
(28, 'pH of water?', 1),


(29, 'NaCl is?', 1),
(29, 'Symbol of Gold?', 1),
(29, 'Gas used in respiration?', 1),


(30, 'Basic unit of life?', 1),
(30, 'Human heart chambers?', 1),
(30, 'Plant makes food by?', 1),


(31, 'DNA stands for?', 1),
(31, 'Blood color due to?', 1),
(31, 'Largest organ?', 1),


(32, 'Binary of 2?', 1),
(32, 'CPU stands for?', 1),
(32, 'RAM is?', 1),


(33, 'HTML is used for?', 1),
(33, 'Full form of URL?', 1),
(33, '1 byte = ?', 1),


(34, 'OS example?', 1),
(34, 'Python is?', 1),
(34, 'IP stands for?', 1),


(35, 'What is 3 + 7?', 1),
(35, 'What is 8 × 2?', 1),
(35, 'What is 20 / 5?', 1),


(36, 'Light speed unit?', 1),
(36, 'Gravity value?', 1),
(36, 'Energy formula?', 1),


(37, 'Chemical symbol of Iron?', 1),
(37, 'Water boiling point?', 1),
(37, 'CO2 is?', 1);

select * from questions;

delete from questions where id in
(select q.id from questions q left join options o on 
q.id=o.question_id GROUP BY q.id having count(o.id)=0) ;

select q.id from questions q left join options o on 
q.id=o.question_id GROUP BY q.id having count(o.id)=0;

INSERT INTO options (question_id, option_text, is_correct) VALUES
(134,'3',false),(134,'4',true),(134,'5',false),(134,'6',false),
(135,'10',false),(135,'15',true),(135,'20',false),(135,'25',false),
(136,'2',false),(136,'3',false),(136,'4',true),(136,'5',false),
(137,'2',false),(137,'3',true),(137,'4',false),(137,'5',false),
(138,'20',false),(138,'25',true),(138,'30',false),(138,'35',false),
(139,'15',false),(139,'16',false),(139,'17',true),(139,'18',false),
(140,'6',false),(140,'8',true),(140,'10',false),(140,'12',false),
(141,'6',false),(141,'7',false),(141,'8',true),(141,'9',false),
(142,'30',false),(142,'36',true),(142,'40',false),(142,'42',false),
(143,'Joule',false),(143,'Newton',true),(143,'Watt',false),(143,'Pascal',false),
(144,'Einstein',false),(144,'Newton',true),(144,'Galileo',false),(144,'Tesla',false),
(145,'Distance/Time',true),(145,'Time/Distance',false),(145,'Mass×Accel',false),(145,'Force/Area',false),
(146,'Newton',false),(146,'Joule',true),(146,'Watt',false),(146,'Volt',false),
(147,'Rate of change of velocity',true),(147,'Speed',false),(147,'Distance',false),(147,'Force',false),
(148,'Gram',false),(148,'Kilogram',true),(148,'Ton',false),(148,'Pound',false),
(149,'Oxygen',false),(149,'Hydrogen',false),(149,'Water',true),(149,'Salt',false),
(150,'6',false),(150,'7',false),(150,'8',true),(150,'9',false),
(151,'6',false),(151,'7',true),(151,'8',false),(151,'9',false),
(152,'Acid',false),(152,'Base',false),(152,'Salt',true),(152,'Gas',false),
(153,'Ag',false),(153,'Au',true),(153,'Fe',false),(153,'Pb',false),
(154,'Oxygen',true),(154,'Nitrogen',false),(154,'Carbon',false),(154,'Hydrogen',false),
(155,'Cell',true),(155,'Tissue',false),(155,'Organ',false),(155,'Atom',false),
(156,'2',false),(156,'3',false),(156,'4',true),(156,'5',false),
(157,'Photosynthesis',true),(157,'Respiration',false),(157,'Digestion',false),(157,'Transpiration',false),
(158,'Deoxyribonucleic Acid',true),(158,'Ribonucleic Acid',false),(158,'Protein',false),(158,'Enzyme',false),
(159,'Hemoglobin',true),(159,'Chlorophyll',false),(159,'Melanin',false),(159,'Keratin',false),
(160,'Skin',true),(160,'Heart',false),(160,'Brain',false),(160,'Liver',false),
(161,'10',false),(161,'11',false),(161,'10 (1010)',true),(161,'12',false),
(162,'Central Process Unit',false),(162,'Central Processing Unit',true),(162,'Computer Personal Unit',false),(162,'Control Processing Unit',false),
(163,'Memory',true),(163,'Storage',false),(163,'Input',false),(163,'Output',false),
(164,'Web pages',true),(164,'Database',false),(164,'Server',false),(164,'OS',false),
(165,'Uniform Resource Locator',true),(165,'Universal Resource Link',false),(165,'Unique Reference Link',false),(165,'Uniform Reference Line',false),
(166,'4 bits',false),(166,'8 bits',true),(166,'16 bits',false),(166,'32 bits',false),
(167,'Windows',true),(167,'HTML',false),(167,'CPU',false),(167,'RAM',false),
(168,'Programming language',true),(168,'Hardware',false),(168,'OS',false),(168,'Browser',false),
(169,'Internet Protocol',true),(169,'Internal Process',false),(169,'Input Port',false),(169,'Integrated Program',false),
(170,'9',false),(170,'10',true),(170,'11',false),(170,'12',false),
(171,'14',false),(171,'16',true),(171,'18',false),(171,'20',false),
(172,'2',false),(172,'3',false),(172,'4',true),(172,'5',false),
(173,'m/s',true),(173,'km',false),(173,'kg',false),(173,'J',false),
(174,'9.8 m/s²',true),(174,'10 m/s',false),(174,'8 m/s²',false),(174,'9 m/s',false),
(175,'E=mc²',true),(175,'F=ma',false),(175,'V=IR',false),(175,'P=IV',false),
(176,'Fe',true),(176,'Ir',false),(176,'In',false),(176,'F',false),
(177,'100°C',true),(177,'90°C',false),(177,'80°C',false),(177,'70°C',false),
(178,'Carbon Dioxide',true),(178,'Oxygen',false),(178,'Hydrogen',false),(178,'Nitrogen',false);

select * from options;
delete from quizzes;