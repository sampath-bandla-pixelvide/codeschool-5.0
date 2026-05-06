-- Active: 1776361631720@@127.0.0.1@5432@youtube@public
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(255) NOT NULL,
  thumbnail_path VARCHAR(255),
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration INTERVAL,
  is_public BOOLEAN DEFAULT TRUE
  liked BOOLEAN DEFAULT false;
);

INSERT INTO videos (title, description, file_path, thumbnail_path, views, likes, duration, is_public)
VALUES
('Intro to HTML', 'Learn basics of HTML', 'https://www.youtube.com/embed/UB1O30fR-EE', 'https://img.youtube.com/vi/UB1O30fR-EE/0.jpg', 120, 15, INTERVAL '10 minutes', TRUE),

('CSS Crash Course', 'Complete CSS guide', 'https://www.youtube.com/embed/yfoY53QXEnI', 'https://img.youtube.com/vi/yfoY53QXEnI/0.jpg', 300, 40, INTERVAL '20 minutes', TRUE),

('JavaScript Basics', 'JS for beginners', 'https://www.youtube.com/embed/W6NZfCO5SIk', 'https://img.youtube.com/vi/W6NZfCO5SIk/0.jpg', 500, 60, INTERVAL '15 minutes', TRUE),

('Flexbox Tutorial', 'Master Flexbox layout', 'https://www.youtube.com/embed/JJSoEo8JSnc', 'https://img.youtube.com/vi/JJSoEo8JSnc/0.jpg', 220, 30, INTERVAL '12 minutes', TRUE),

('Bootstrap Guide', 'Responsive design using Bootstrap', 'https://www.youtube.com/embed/-qfEOE4vtxE', 'https://img.youtube.com/vi/-qfEOE4vtxE/0.jpg', 410, 55, INTERVAL '18 minutes', TRUE),

('jQuery Basics', 'Learn jQuery quickly', 'https://www.youtube.com/embed/PoRJizFvM7s', 'https://img.youtube.com/vi/PoRJizFvM7s/0.jpg', 150, 20, INTERVAL '9 minutes', TRUE),

('SQL Tutorial', 'Learn SQL from scratch', 'https://www.youtube.com/embed/HXV3zeQKqGY', 'https://img.youtube.com/vi/HXV3zeQKqGY/0.jpg', 800, 120, INTERVAL '30 minutes', TRUE),

('PostgreSQL Intro', 'Basics of PostgreSQL', 'https://www.youtube.com/embed/qw--VYLpxG4', 'https://img.youtube.com/vi/qw--VYLpxG4/0.jpg', 260, 35, INTERVAL '14 minutes', TRUE),

('Node.js Crash Course', 'Backend with Node.js', 'https://www.youtube.com/embed/fBNz5xF-Kx4', 'https://img.youtube.com/vi/fBNz5xF-Kx4/0.jpg', 600, 90, INTERVAL '25 minutes', TRUE),

('React Basics', 'React for beginners', 'https://www.youtube.com/embed/bMknfKXIFA8', 'https://img.youtube.com/vi/bMknfKXIFA8/0.jpg', 950, 150, INTERVAL '40 minutes', TRUE),

('Git Tutorial', 'Version control with Git', 'https://www.youtube.com/embed/RGOj5yH7evk', 'https://img.youtube.com/vi/RGOj5yH7evk/0.jpg', 700, 100, INTERVAL '35 minutes', TRUE),

('API Integration', 'How to use APIs', 'https://www.youtube.com/embed/Oe421EPjeBE', 'https://img.youtube.com/vi/Oe421EPjeBE/0.jpg', 320, 45, INTERVAL '16 minutes', TRUE),

('JSON Explained', 'Understanding JSON', 'https://www.youtube.com/embed/iiADhChRriM', 'https://img.youtube.com/vi/iiADhChRriM/0.jpg', 210, 25, INTERVAL '11 minutes', TRUE),

('Async JS', 'Promises and async/await', 'https://www.youtube.com/embed/V_Kr9OSfDeU', 'https://img.youtube.com/vi/V_Kr9OSfDeU/0.jpg', 430, 65, INTERVAL '22 minutes', TRUE),

('Full Stack Overview', 'Frontend + Backend roadmap', 'https://www.youtube.com/embed/nu_pCVPKzTk', 'https://img.youtube.com/vi/nu_pCVPKzTk/0.jpg', 1000, 200, INTERVAL '45 minutes', TRUE);

CREATE TABLE user_video_likes (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  video_id INT UNIQUE REFERENCES videos(id) ON DELETE CASCADE,
  liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, video_id)
);



CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_videos (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  video_id INT REFERENCES videos(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, video_id)
);

CREATE TABLE video_categories (
  video_id INT REFERENCES videos(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, category_id)
);

CREATE TABLE otps (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  otp_code VARCHAR(255) NOT NULL,
  otp_expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 seconds',
  is_active boolean Not NULL default true
);



CREATE TABLE user_temp_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  temp_token VARCHAR(255) UNIQUE NOT NULL,
  issued_at TIMESTAMP DEFAULT  CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '5 minutes',
  is_active boolean Not NULL default true
);


CREATE TABLE user_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active boolean Not NULL default true
);



INSERT INTO categories (name) VALUES
('Frontend Development'),
('JavaScript'),
('Backend Development'),
('Databases'),
('Full Stack'),
('Version Control'),
('Data Formats');

INSERT INTO video_categories (video_id, category_id)
VALUES (1, (SELECT id FROM categories WHERE name = 'Frontend Development')),
       (2, (SELECT id FROM categories WHERE name = 'Frontend Development')),
       (4, (SELECT id FROM categories WHERE name = 'Frontend Development')),
       (5, (SELECT id FROM categories WHERE name = 'Frontend Development'));

INSERT INTO video_categories (video_id, category_id)
VALUES (3, (SELECT id FROM categories WHERE name = 'JavaScript')),
       (6, (SELECT id FROM categories WHERE name = 'JavaScript')),
       (14, (SELECT id FROM categories WHERE name = 'JavaScript'));

INSERT INTO video_categories (video_id, category_id)
VALUES (9, (SELECT id FROM categories WHERE name = 'Backend Development')),
       (12, (SELECT id FROM categories WHERE name = 'Backend Development'));

INSERT INTO video_categories (video_id, category_id)
VALUES (7, (SELECT id FROM categories WHERE name = 'Databases')),
       (8, (SELECT id FROM categories WHERE name = 'Databases'));
INSERT INTO video_categories (video_id, category_id)
VALUES (15, (SELECT id FROM categories WHERE name = 'Full Stack'));

INSERT INTO video_categories (video_id, category_id)
VALUES (11, (SELECT id FROM categories WHERE name = 'Version Control'));

INSERT INTO video_categories (video_id, category_id)
VALUES (13, (SELECT id FROM categories WHERE name = 'Data Formats'));

INSERT INTO videos (title, description, file_path, thumbnail_path, views, likes, duration)
VALUES
('Ganesha in Nature','Ganesha in tree trunk,nature','./styles/assets/145166-786132463.mp4',null,100,100,INTERVAL '1 minute')

INSERT INTO categories (name) VALUES('devotional'),('nature');

INSERT INTO video_categories (video_id, category_id)
VALUES (16,(SELECT id FROM categories WHERE name = 'devotional'));
INSERT INTO video_categories (video_id, category_id)
VALUES (16,(SELECT id FROM categories WHERE name = 'nature'));

CREATE TABLE video_comments (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id INT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  commented_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);



