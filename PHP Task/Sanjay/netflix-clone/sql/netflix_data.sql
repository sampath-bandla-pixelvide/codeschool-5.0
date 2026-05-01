-- Active: 1775629722491@@127.0.0.1@5432@netflix@public
create table users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(125) NOT NULL,
    last_name VARCHAR(125) NOT NULL,
    email VARCHAR(125) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    password VARCHAR(225) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * from users;

create table user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id),
    token VARCHAR(225) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '10 days',
    is_active BOOLEAN DEFAULT true
);

select * from user_tokens;

CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rating NUMERIC(3, 1) NOT NULL,
    duration INT NOT NULL,
    thumbnail TEXT NOT NULL,
    trailer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE movie_languages (
    movie_id INT REFERENCES movies (id) ON DELETE CASCADE,
    language_id INT REFERENCES languages (id),
    PRIMARY KEY (movie_id, language_id)
);

CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(225) UNIQUE NOT NULL
);

CREATE TABLE movies_category (
    movie_id INT REFERENCES movies (id) ON DELETE CASCADE,
    category_id INT REFERENCES category (id),
    PRIMARY KEY (movie_id, category_id)
);

CREATE TABLE actors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movie_actors (
    movie_id INT REFERENCES movies (id) ON DELETE CASCADE,
    actor_id INT REFERENCES actors (id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, actor_id)
);

INSERT INTO languages (name) VALUES ('Telugu'), ('English');

INSERT INTO
    category (category_name)
VALUES ('Action'),
    ('Thriller'),
    ('Horror'),
    ('Crime');
select * from category;

delete from movies where id<7;
select * from movies;

INSERT INTO
    movies (
        title,
        description,
        rating,
        duration,
        thumbnail,
        trailer
    )
VALUES
    -- Telugu Row (6)
    (
        'RRR',
        'Epic action drama',
        8.5,
        182,
        'https://tse1.mm.bing.net/th/id/OIP.1TDxlW4gnL97TFrzHtu-EwHaEK?pid=Api&P=0&h=180',
        'https://www.youtube.com/embed/2_BkCz3OnlY?si=62ivI4OybLXDgLv0'
    ),
    (
        'Pushpa',
        'Rise of red sandalwood smuggler',
        7.8,
        175,
        'https://tse4.mm.bing.net/th/id/OIP.x96BXnbTQfj6DV3SdA5_FwHaEK?pid=Api&P=0&h=180',
        'https://www.youtube.com/embed/Q1NKMPhP8PY?si=zv7HUXTPHjHYnvZ3'
    ),
    (
        'Salaar',
        'Violent action story',
        8.2,
        170,
        'https://tse2.mm.bing.net/th/id/OIP.peZZ2KOQ72wsTJcRZH36HgHaEK?pid=Api&P=0&h=180',
        'https://www.youtube.com/embed/4GPvYMKtrtI?si=I9yu10uoC5tahzDd'
    ),
    (
        'Arjun Reddy',
        'Intense love story',
        8.1,
        165,
        'https://tse1.mm.bing.net/th/id/OIP.iGk9NIyEiPQ08AC6VwbaywHaEK?pid=Api&P=0&h=180',
        'https://www.youtube.com/embed/aozErj9NqeE?si=-4myN8X0Lv_HGA4l'
    ),
    (
        'Baahubali',
        'Historic epic',
        8.7,
        180,
        'https://tse2.mm.bing.net/th/id/OIP.Ccqi_TFRdFh8RI4LfM04jgHaEc?pid=Api&P=0&h=180',
        'https://www.youtube.com/embed/qD-6d8Wo3do?si=QOfl7oAOUjCqYDVt'
    ),
    (
        'Eega',
        'Revenge story of a fly',
        7.9,
        140,
        'https://tse4.mm.bing.net/th/id/OIP.fKm58t8DGUSNA6XJiDudxAHaEK?pid=Api&P=0&h=180',
        'https://www.youtube.com/embed/x-1ZoU1xB4I?si=VJ6kZZ_TyWijG3sh'
    );

INSERT INTO
    movie_languages
VALUES (7, 1),
    (8, 1),
    (9, 1),
    (10, 1),
    (11, 1),
    (12, 1);

delete from movie_languages;

INSERT INTO
    movies (
        title,
        description,
        rating,
        duration,
        thumbnail,
        trailer
    )
VALUES
    -- Action Row (6)
    (
        'John Wick',
        'Assassin revenge',
        8.3,
        140,
        'https://tse4.mm.bing.net/th/id/OIP.OiiwAnTZTgYNJpxi_cpUXwHaEK?pid=Api&P=0&h=180',
        'https://www.youtube.com/embed/M7XM597XO94?si=-UQ7_d6UUeR4hPMQ'
    ),
    (
        'Extraction',
        'Rescue mission',
        7.5,
        130,
        'https://tse1.mm.bing.net/th/id/OIP.2mVKeT3k8JV810_xelN9ywHaEK?pid=Api&P=0&h=180',
        'ttps://www.youtube.com/embed/L6P3nI6VnlY?si=cbdUu0IClrBaB2az'
    ),
    (
        'Mad Max',
        'Post-apocalyptic action',
        8.1,
        150,
        'https://tse1.mm.bing.net/th/id/OIP.Vuy80QuaUIpqydh_r3_K_wHaEK?pid=Api&P=0&h=180',
        'https://www.youtube.com/embed/hEJnMQG9ev8?si=XJz0nNRMnBfFMTV6'
    ),
    (
        'Gladiator',
        'Roman warrior',
        8.5,
        155,
        'https://tse2.mm.bing.net/th/id/OIP.LJ2TowZo8al6wGyh5a1GBgHaEK?pid=Api&P=0&h=180',
        'https://www.youtube.com/embed/TcYIqlBihW4?si=ukTex-mF_QBV1sX6'
    ),
    (
        'Avengers',
        'Superhero team',
        8.0,
        160,
        'https://tse4.mm.bing.net/th/id/OIP.CIXxgBXzeAgwrhwTgQPJswHaEK?pid=Api&P=0&h=180',
        'https://www.youtube.com/embed/TcMBFSGVi1c?si=ajh9XNzpYdeFcYJd'
    ),
    (
        'Batman',
        'Dark knight rises',
        8.4,
        150,
        'https://tse3.mm.bing.net/th/id/OIP.fiT-RwePZSoQgl2vx0sjywHaDl?pid=Api&P=0&h=180',
        'https://www.youtube.com/embed/mqqft2x_Aa4?si=XplvKftu4TNzv2YX'
    ),
-- -- Thriller Row (6)
(
    'Se7en',
    'Serial killer hunt',
    8.6,
    127,
    'https://tse1.mm.bing.net/th/id/OIP.D6s2JbHlgAnavH62djiYtAHaEK?pid=Api&P=0&h=180',
    'https://www.youtube.com/embed/KPOuJGkpblk?si=Zi6fywlN1il-XAXb'
),
(
    'Gone Girl',
    'Mystery disappearance',
    8.1,
    145,
    'https://www.twulasso.com/wp-content/uploads/2014/10/GoneGirl.jpg',
    'https://www.youtube.com/embed/2-_-1nJf8Vg?si=wonasdqgLlLhlZxo'
),
(
    'Prisoners',
    'Kidnapping case',
    8.2,
    153,
    'https://tse1.mm.bing.net/th/id/OIP.pzyY4CDvGmgt6g6KrazCHgHaEo?pid=Api&P=0&h=180',
    'https://www.youtube.com/embed/bpXfcTF6iVk?si=xugC4SYXtj8tPOyq'
),
(
    'Zodiac',
    'True crime mystery',
    7.9,
    157,
    'https://tse4.mm.bing.net/th/id/OIP.dtmDdT9xY_ituqhDPI9XjQHaEC?pid=Api&P=0&h=180',
    'https://www.youtube.com/embed/f9cDKbmCD0o?si='
),
(
    'Shutter Island',
    'Psychological thriller',
    8.2,
    138,
    'https://tse4.mm.bing.net/th/id/OIP.0b_q6KKhu_-xoqHVGDUqOgHaEK?pid=Api&P=0&h=180',
    'https://www.youtube.com/embed/v8yrZSkKxTA?si=Q4gYZlyDyeooaSEm'
),
(
    'The Girl on Train',
    'Suspense drama',
    6.5,
    140,
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScQuqieH9IjBNkm7B6_Qe27IKcGL67vx9MKw&s',
    'https://www.youtube.com/embed/LE8-4aRf5VQ?si=4JLL95_S7Fd9miia'
),
-- Horror movies(6)
(
    'Conjuring',
    'Haunted house',
    8.0,
    112,
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRQjDhPnObuRFmKyky5J6NW9VCDcimxNcIgg&s',
    'https://www.youtube.com/embed/ejMMn0t58Lc?si=1kqzgZD0fwjqToJb'
),
(
    'Insidious',
    'Paranormal horror',
    7.6,
    103,
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSQdsHoWHN4_vM8VpuQPDGgKKqq8F5M2S5Vw&s',
    'https://www.youtube.com/embed/jxU8FU3o75A?si=UheUhYFRlz8Nhh_T'
),
(
    'Annabelle',
    'Doll horror',
    6.9,
    100,
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfo7lRKnnNeZ_XvglAAUX_j4m6FFPPgf12Rg&s',
    'https://www.youtube.com/embed/bCxm7cTpBAs?si=jYwOa9YHVJs6NU7I'
),
(
    'It',
    'Clown terror',
    7.3,
    135,
    'https://encrypted-tbn0.gstatic.com/imageshttps://www.youtube.com/embed/xhJ5P7Up3jA?si=kC1qelVPnvpp-h5K',
    'https://www.youtube.com/embed/xhJ5P7Up3jA?si=UTE7tNjLgsCiw3Wu'
),
(
    'Nun',
    'Dark horror',
    5.5,
    96,
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1QKkmuOSU9K5dgdOhOhkVfyzgReKp4OOZ9g&s',
    'https://www.youtube.com/embed/pzD9zGcUNrw?si=HXLIxO5PUASjodQD'
),
(
    'Hereditary',
    'Dark horror',
    5.5,
    124,
    'https://images2.alphacoders.com/112/1122556.jpg',
    'https://www.youtube.com/embed/V6wWKNij_1M?si=ETSkgskkgulaxGAU'
)

-- -- Crime Row (6)
INSERT INTO
    movies (
        title,
        description,
        rating,
        duration,
        thumbnail,
        trailer
    )
VALUES
(
    'Narcos',
    'Drug cartel story',
    8.8,
    50,
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYGl2JtuJ_Vm3Z60AEHVNDoccfRwJOw40SfQ&s',
    'https://www.youtube.com/embed/1nannle9DaE?si=VCnPL3LEUWVsoPHX'
),
(
    'Breaking Bad',
    'Crime drama',
    9.5,
    47,
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDykVT4-k1UIVSBBeE87YZFd33GjlvdOXyuQ&s',
    'https://www.youtube.com/embed/HhesaQXLuRY?si=QxGmqbcDjZNtyB9_'
),
(
    'Peaky Blinders',
    'Gang story',
    8.8,
    60,
    'https://tse3.mm.bing.net/th/id/OIP.1CQtz7cr7b1kUUpP1L-y9QHaEK?pid=Api&P=0&h=180',
    'https://www.youtube.com/embed/_Dfc89TY-aA?si=TqxXVHWC1rJIvwOR'
),
(
    'Godfather',
    'Mafia legacy',
    9.2,
    175,
    'https://tse4.mm.bing.net/th/id/OIP.i0mS34zLxQ-Yrg-dRwCHvwHaEK?pid=Api&P=0&h=180',
    'https://www.youtube.com/embed/UaVTIH8mujA?si=-91IQaVh6mniKgJE'
),
(
    'Scarface',
    'Drug lord rise',
    8.3,
    170,
    'https://tse2.mm.bing.net/th/id/OIP.kt6XJGL_6-lbdHaFlxyhIQHaEK?pid=Api&P=0&h=180',
    'https://www.youtube.com/embed/cv276Wg3e7I?si=EoSuRg4Dw1oKgiVP'
),
(
    'The Departed',
    'Undercover cops',
    8.5,
    151,
    'https://tse3.mm.bing.net/th/id/OIP.YX8qPwu2bDadCm6znOvdTAHaEK?pid=Api&P=0&h=180',
    'https://www.youtube.com/embed/r-MiSNsCdQ4?si=XCkRKfEykxSwYjVT'
);

select * from movies_category;

-- Action (13–18)
INSERT INTO movies_category VALUES
(13,1),(14,1),(15,1),(16,1),(17,1),(18,1);

-- Thriller (19–24)
INSERT INTO movies_category VALUES
(19,2),(20,2),(21,2),(22,2),(23,2),(24,2);

-- Horror (25–30)
INSERT INTO movies_category VALUES
(25,3),(26,3),(27,3),(28,3),(29,3),(30,3);

-- Crime (31–36)
INSERT INTO movies_category VALUES
(31,4),(32,4),(33,4),(34,4),(35,4),(36,4);

select * from movies_category;

SELECT title,thumbnail from movies join movies_category on movies.id=movies_category.movie_id join category on movies_category.category_id=category.id where category.category_name LIKE 'Action';

UPDATE movies set thumbnail = 'https://occ-0-2042-3663.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABYvNXYDwzY45uF87XeBJECTEyu90AcWbHs1gw2WeSn6fSSb_xNjRZFjNAP_k0vvUVN-_QWD9RLq5igWc_2MRBmJuai8rRWxUkNc.webp?r=f33',title='American Psycho' where id=19;

delete from movies_category where movie_id=19;

DELETE FROM movies WHERE id=19;
-- SELECT thumbnail FROM movies JOIN movie_languages on movies.id=movie_languages.movie_id JOIN languages on movie_languages.language_id=languages.id;
INSERT INTO actors (name) VALUES
('Prabhas'),
('Ram Charan'),
('NTR Jr'),
('Allu Arjun'),
('Keanu Reeves'),
('Chris Hemsworth'),
('Leonardo DiCaprio'),
('Brad Pitt'),
('Al Pacino'),
('Robert De Niro');

SELECT id FROM movies ORDER BY id;

-- Telugu Movies (7–12)
INSERT INTO movie_actors VALUES
(7,2),(7,3),
(8,4),
(9,1),(9,3),
(10,7),
(11,1),(11,2),
(12,4);

-- Action Movies (13–18)
INSERT INTO movie_actors VALUES
(13,5),
(14,6),
(15,8),
(16,9),
(17,6),
(18,5);

-- Thriller (20–25)  -- skipped 19
INSERT INTO movie_actors VALUES
(20,8),
(21,7),
(22,7),
(23,8),
(24,7),
(25,8);

-- Horror (26–31)
INSERT INTO movie_actors VALUES
(26,10),
(27,10),
(28,10),
(29,10),
(30,10),
(31,10);

-- Crime (32–37)
INSERT INTO movie_actors VALUES
(32,9),
(33,9),
(34,8),
(35,9),
(36,9);

select * from movie_actors ORDER BY movie_id ASC;

INSERT INTO movie_languages
SELECT id, 2 FROM movies WHERE id >12;


SELECT 
    m.id,
    m.title,
    m.description,
    m.rating,
    m.duration,
    m.thumbnail,
    m.trailer,
    STRING_AGG(a.name, ',') AS actors

FROM movies m

JOIN movie_languages ml ON m.id = ml.movie_id
JOIN languages l ON ml.language_id = l.id

LEFT JOIN movie_actors ma ON m.id = ma.movie_id
LEFT JOIN actors a ON ma.actor_id = a.id

WHERE l.name = 'Telugu' 

GROUP BY m.id;

SELECT 
    m.id,
    m.title,
    m.description,
    m.rating,
    m.duration,
    m.thumbnail,
    m.trailer,
    c.category_name,
    STRING_AGG(a.name, ',' ) AS actors

FROM movies m

JOIN movies_category mc ON m.id = mc.movie_id
JOIN category c ON mc.category_id = c.id

JOIN movie_languages ml ON m.id = ml.movie_id
JOIN languages l ON ml.language_id = l.id

LEFT JOIN movie_actors ma ON m.id = ma.movie_id
LEFT JOIN actors a ON ma.actor_id = a.id

WHERE c.category_name = 'Action'   -- 'Action'     -- 'Telugu'

GROUP BY m.id, c.category_name
ORDER BY m.id ASC;
    
INSERT INTO category(category_name) VALUES('drama'),('love'),('epic'),('revenge');

delete from movies_category where movie_id='8' and category_id='6';


INSERT INTO movies_category(movie_id,category_id) VALUES(7,7),(7,8),(8,6),(8,8),(9,8),(10,6),(11,7),(12,8);

create table otps(
    id SERIAL PRIMARY KEY,
    email_id VARCHAR(225),
    otp VARCHAR(225),
    expire_at TIMESTAMP DEFAULT current_timestamp + interval '2 minutes',
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

alter table otps ADD COLUMN status BOOLEAN DEFAULT true;

SELECT * from otps ORDER BY id;