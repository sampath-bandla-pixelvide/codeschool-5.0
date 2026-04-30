-- Active: 1775629757833@@127.0.0.1@5432@imdb@public
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM users;

CREATE TABLE otp_codes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id) ON DELETE CASCADE,
    otp_code VARCHAR(6) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM otp_codes;

CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id) ON DELETE CASCADE,
    token VARCHAR(100) NOT NULL,
    expiry_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM user_tokens;

CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    release_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM movies;

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id) ON DELETE CASCADE,
    movie_id INT REFERENCES movies (id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM reviews;

CREATE TABLE watchlist (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id) ON DELETE CASCADE,
    movie_id INT REFERENCES movies (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, movie_id)
);

SELECT * FROM watchlist;

INSERT INTO
    movies (
        title,
        description,
        image,
        release_year
    )
VALUES (
        'Inception',
        'A thief enters dreams to steal secrets and plant ideas.',
        'images/movies/inception.jpg',
        2010
    ),
    (
        'Interstellar',
        'A team travels through space to save humanity.',
        'images/movies/interstellar.jpg',
        2014
    ),
    (
        'The Dark Knight',
        'Batman faces the Joker in Gotham City.',
        'images/movies/dark-knight.jpg',
        2008
    ),
    (
        'Avatar',
        'A marine explores the world of Pandora.',
        'images/movies/avatar.jpg',
        2009
    ),
    (
        'Avengers Endgame',
        'The Avengers fight to reverse the snap.',
        'images/movies/endgame.jpg',
        2019
    ),
    (
        'KGF Chapter 2',
        'Rocky becomes the most feared man in Kolar Gold Fields.',
        'images/movies/kgf2.jpg',
        2022
    ),
    (
        'Titanic',
        'A love story unfolds during the Titanic disaster.',
        'images/movies/titanic.jpg',
        1997
    ),
    (
        'Joker',
        'The origin story of Gotham’s infamous villain.',
        'images/movies/joker.jpg',
        2019
    ),
    (
        'Spider-Man No Way Home',
        'Spider-Man faces villains from other universes.',
        'images/movies/spiderman.jpg',
        2021
    ),
    (
        'Bahubali The Beginning',
        'A young man learns about his royal heritage.',
        'images/movies/bahubali1.jpg',
        2015
    ),
    (
        'Bahubali The Conclusion',
        'The battle for the kingdom reaches its climax.',
        'images/movies/bahubali2.jpg',
        2017
    ),
    (
        'RRR',
        'Two revolutionaries fight against British rule.',
        'images/movies/rrr.jpg',
        2022
    ),
    (
        'Dangal',
        'A wrestler trains his daughters to become champions.',
        'images/movies/dangal.jpg',
        2016
    ),
    (
        '3 Idiots',
        'Three friends navigate college and life.',
        'images/movies/3idiots.jpg',
        2009
    ),
    (
        'Doctor Strange',
        'A surgeon becomes a master of mystical arts.',
        'images/movies/doctor-strange.jpg',
        2016
    ),
    (
        'Black Panther',
        'The king of Wakanda fights to protect his nation.',
        'images/movies/black-panther.jpg',
        2018
    ),
    (
        'Fast and Furious 7',
        'A team faces a dangerous enemy seeking revenge.',
        'images/movies/fast7.jpg',
        2015
    ),
    (
        'John Wick',
        'A retired assassin seeks revenge for his dog.',
        'images/movies/john-wick.jpg',
        2014
    ),
    (
        'Pushpa The Rise',
        'A laborer rises in the red sandalwood smuggling world.',
        'images/movies/pushpa.jpg',
        2021
    ),
    (
        'Salaar',
        'A violent man rises to power in a dark world.',
        'images/movies/salaar.jpg',
        2023
    );

INSERT INTO
    users (name, email, phone)
VALUES (
        'Venkatesh',
        'venky@gmail.com',
        '9999999999'
    );

INSERT INTO
    reviews (
        user_id,
        movie_id,
        rating,
        review_text
    )
VALUES (1, 1, 5, 'Amazing movie!');

SELECT * from reviews;

SELECT * FROM reviews WHERE movie_id = 1;

SELECT * FROM users;

SELECT * FROM otp_codes ORDER BY id DESC;

SELECT * FROM user_tokens;

SELECT id, user_id, movie_id, rating, review_text FROM reviews;

SELECT user_id, token FROM user_tokens ORDER BY id DESC;

DELETE FROM reviews;

ALTER TABLE users
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE celebrities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image VARCHAR(255),
    ranking INT,
    popularity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM celebrities;

INSERT INTO
    celebrities (
        name,
        image,
        ranking,
        popularity
    )
VALUES (
        'Patrick Muldoon',
        'images/celebrities/actor1.jpg',
        1,
        10952
    ),
    (
        'Priscilla Delgado',
        'images/celebrities/actor2.jpg',
        2,
        5338
    ),
    (
        'Jaafar Jackson',
        'images/celebrities/actor3.jpg',
        3,
        3500
    ),
    (
        'Cailee Spaeny',
        'images/celebrities/actor4.jpg',
        4,
        2900
    ),
    (
        'Taron Egerton',
        'images/celebrities/actor5.jpg',
        5,
        2500
    ),
    (
        'Charlize Theron',
        'images/celebrities/actor6.jpg',
        6,
        2200
    ),
    (
        'Leonardo DiCaprio',
        'images/celebrities/actor7.jpg',
        7,
        2100
    ),
    (
        'Robert Downey Jr.',
        'images/celebrities/actor8.jpg',
        8,
        1900
    ),
    (
        'Tom Hardy',
        'images/celebrities/actor9.jpg',
        9,
        1700
    ),
    (
        'Emma Stone',
        'images/celebrities/actor10.jpg',
        10,
        1600
    ),
    (
        'Chris Evans',
        'images/celebrities/actor11.jpg',
        11,
        1500
    ),
    (
        'Zendaya',
        'images/celebrities/actor12.jpg',
        12,
        1400
    );