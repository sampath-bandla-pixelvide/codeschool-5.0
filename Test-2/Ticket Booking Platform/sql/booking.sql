-- Active: 1775629722491@@127.0.0.1@5432@sample@public
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(10) NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));


CREATE TABLE IF NOT EXISTS genres (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL UNIQUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_genres_name ON genres(name);

CREATE TABLE IF NOT EXISTS actors (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  photo_url    TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
  id             SERIAL PRIMARY KEY,
  title          VARCHAR(300) NOT NULL,
  description    TEXT,
  duration_mins  INT NOT NULL CHECK (duration_mins > 0),
  poster_url     TEXT,
  language       VARCHAR(50) DEFAULT 'English',
  release_date   DATE,
  rating         NUMERIC(3,1) CHECK (rating >= 0 AND rating <= 10),
  genre_id       INT REFERENCES genres(id) ON DELETE SET NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movies_genre ON movies(genre_id);
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);

CREATE TABLE IF NOT EXISTS movie_actors (
  movie_id    INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  actor_id    INT NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, actor_id)
);

CREATE INDEX IF NOT EXISTS idx_movie_actors_movie ON movie_actors(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_actors_actor ON movie_actors(actor_id);


CREATE TABLE IF NOT EXISTS movie_carousel_images (
  id SERIAL PRIMARY KEY,
  movie_id INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mci_movie ON movie_carousel_images(movie_id);

CREATE TABLE IF NOT EXISTS theatres (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  location     VARCHAR(300) NOT NULL,
  total_seats  INT NOT NULL CHECK (total_seats > 0),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS shows (
  id           SERIAL PRIMARY KEY,
  movie_id     INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  theatre_id   INT NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
  show_date    DATE NOT NULL,
  show_time    TIME NOT NULL,
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shows_movie     ON shows(movie_id);
CREATE INDEX IF NOT EXISTS idx_shows_theatre   ON shows(theatre_id);
CREATE INDEX IF NOT EXISTS idx_shows_date      ON shows(show_date);


CREATE TABLE IF NOT EXISTS seats (
  id           SERIAL PRIMARY KEY,
  show_id      INT NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  seat_number  VARCHAR(10) NOT NULL,
  seat_row     VARCHAR(5) NOT NULL,
  is_booked    BOOLEAN DEFAULT false,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (show_id, seat_number)
);

CREATE INDEX IF NOT EXISTS idx_seats_show     ON seats(show_id);
CREATE INDEX IF NOT EXISTS idx_seats_booked   ON seats(is_booked);


CREATE TABLE IF NOT EXISTS bookings (
  id               SERIAL PRIMARY KEY,
  user_id          INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  show_id          INT NOT NULL REFERENCES shows(id) ON DELETE RESTRICT,
  reference_number VARCHAR(20) NOT NULL UNIQUE,
  total_amount     NUMERIC(10,2) NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                   CHECK (status IN ('confirmed', 'cancelled')),
  booking_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_user    ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_show    ON bookings(show_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ref     ON bookings(reference_number);

CREATE TABLE IF NOT EXISTS booking_seats (
  id          SERIAL PRIMARY KEY,
  booking_id  INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id     INT NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (booking_id, seat_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_seats_booking ON booking_seats(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_seats_seat    ON booking_seats(seat_id);

INSERT INTO genres (name) VALUES
  ('Action'),
  ('Drama'),
  ('Comedy'),
  ('Thriller'),
  ('Sci-Fi'),
  ('Romance'),
  ('Horror'),
  ('Animation')
ON CONFLICT (name) DO NOTHING;


INSERT INTO actors (name, photo_url) VALUES
  ('Leonardo DiCaprio', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Leonardo_Dicaprio_Cannes_2019.jpg/440px-Leonardo_Dicaprio_Cannes_2019.jpg'),
  ('Scarlett Johansson', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Scarlett_Johansson_2010.jpg/440px-Scarlett_Johansson_2010.jpg'),
  ('Tom Hanks', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Tom_Hanks_TIFF_2019.jpg/440px-Tom_Hanks_TIFF_2019.jpg'),
  ('Natalie Portman', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Natalie_Portman_Cannes_2015_2.jpg/440px-Natalie_Portman_Cannes_2015_2.jpg'),
  ('Robert Downey Jr.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Robert_Downey_Jr_2014_Comic_Con_%28cropped%29.jpg/440px-Robert_Downey_Jr_2014_Comic_Con_%28cropped%29.jpg')
ON CONFLICT DO NOTHING;


INSERT INTO theatres (name, location, total_seats) VALUES
  ('Cineplex Grand', 'MG Road, Bengaluru', 120),
  ('PVR Cinemas', 'Phoenix Mall, Chennai', 90),
  ('INOX Luxe', 'Hitech City, Hyderabad', 80),
  ('Multiplex Arena', 'Connaught Place, Delhi', 100)
ON CONFLICT DO NOTHING;


INSERT INTO movies (title, description, duration_mins, poster_url, language, release_date, rating, genre_id) VALUES
  (
    'Inception',
    'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    148,
    'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    'English',
    '2010-07-16',
    8.8,
    (SELECT id FROM genres WHERE name = 'Sci-Fi')
  ),
  (
    'The Dark Knight',
    'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    152,
    'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    'English',
    '2008-07-18',
    9.0,
    (SELECT id FROM genres WHERE name = 'Action')
  ),
  (
    'Interstellar',
    'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
    169,
    'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    'English',
    '2014-11-07',
    8.6,
    (SELECT id FROM genres WHERE name = 'Sci-Fi')
  ),
  (
    'Forrest Gump',
    'The history of the United States from the 1950s to the 70s unfolds from the perspective of an Alabama man with an IQ of 75.',
    142,
    'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    'English',
    '1994-07-06',
    8.8,
    (SELECT id FROM genres WHERE name = 'Drama')
  ),
  (
    'Avengers: Endgame',
    'After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos actions and restore balance to the universe.',
    181,
    'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    'English',
    '2019-04-26',
    8.4,
    (SELECT id FROM genres WHERE name = 'Action')
  ),
  (
    'The Notebook',
    'A poor yet passionate young man falls in love with a rich young woman, giving her a sense of freedom, but they are soon separated because of their social differences.',
    123,
    'https://image.tmdb.org/t/p/w500/qom1SZSENdmHFNZBXbtLAGBQ1x6.jpg',
    'English',
    '2004-06-25',
    7.8,
    (SELECT id FROM genres WHERE name = 'Romance')
  )
ON CONFLICT DO NOTHING;


INSERT INTO movie_actors (movie_id, actor_id) VALUES
  ((SELECT id FROM movies WHERE title='Inception'         LIMIT 1), (SELECT id FROM actors WHERE name='Leonardo DiCaprio'  LIMIT 1)),
  ((SELECT id FROM movies WHERE title='Forrest Gump'      LIMIT 1), (SELECT id FROM actors WHERE name='Tom Hanks'          LIMIT 1)),
  ((SELECT id FROM movies WHERE title='Avengers: Endgame' LIMIT 1), (SELECT id FROM actors WHERE name='Scarlett Johansson' LIMIT 1)),
  ((SELECT id FROM movies WHERE title='Avengers: Endgame' LIMIT 1), (SELECT id FROM actors WHERE name='Robert Downey Jr.'  LIMIT 1))
ON CONFLICT DO NOTHING;


INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price) VALUES
  ((SELECT id FROM movies WHERE title='Inception'         LIMIT 1), (SELECT id FROM theatres WHERE name='Cineplex Grand'  LIMIT 1), CURRENT_DATE + 1, '10:00', 250.00),
  ((SELECT id FROM movies WHERE title='Inception'         LIMIT 1), (SELECT id FROM theatres WHERE name='Cineplex Grand'  LIMIT 1), CURRENT_DATE + 1, '14:00', 300.00),
  ((SELECT id FROM movies WHERE title='Inception'         LIMIT 1), (SELECT id FROM theatres WHERE name='PVR Cinemas'     LIMIT 1), CURRENT_DATE + 2, '16:30', 280.00),
  ((SELECT id FROM movies WHERE title='The Dark Knight'   LIMIT 1), (SELECT id FROM theatres WHERE name='INOX Luxe'       LIMIT 1), CURRENT_DATE + 1, '11:00', 220.00),
  ((SELECT id FROM movies WHERE title='The Dark Knight'   LIMIT 1), (SELECT id FROM theatres WHERE name='Multiplex Arena' LIMIT 1), CURRENT_DATE + 3, '19:00', 350.00),
  ((SELECT id FROM movies WHERE title='Interstellar'      LIMIT 1), (SELECT id FROM theatres WHERE name='Cineplex Grand'  LIMIT 1), CURRENT_DATE + 2, '13:00', 260.00),
  ((SELECT id FROM movies WHERE title='Forrest Gump'      LIMIT 1), (SELECT id FROM theatres WHERE name='PVR Cinemas'     LIMIT 1), CURRENT_DATE + 1, '15:00', 200.00),
  ((SELECT id FROM movies WHERE title='Avengers: Endgame' LIMIT 1), (SELECT id FROM theatres WHERE name='Multiplex Arena' LIMIT 1), CURRENT_DATE + 1, '18:00', 400.00),
  ((SELECT id FROM movies WHERE title='The Notebook'      LIMIT 1), (SELECT id FROM theatres WHERE name='INOX Luxe'       LIMIT 1), CURRENT_DATE + 4, '12:00', 180.00)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_show        RECORD;
  v_theatre     RECORD;
  v_rows        TEXT[] := ARRAY['A','B','C','D','E','F','G','H','I','J'];
  v_row_label   TEXT;
  v_seat_num    INT;
  v_seats_per_row INT;
  v_row_idx     INT;
BEGIN
  FOR v_show IN SELECT s.id AS show_id, s.theatre_id FROM shows s LOOP
    -- Only generate if no seats yet
    IF NOT EXISTS (SELECT 1 FROM seats WHERE show_id = v_show.show_id) THEN
      SELECT total_seats INTO v_theatre FROM theatres WHERE id = v_show.theatre_id;
      v_seats_per_row := CEIL(v_theatre.total_seats::NUMERIC / 10);
      FOR v_row_idx IN 1..10 LOOP
        v_row_label := v_rows[v_row_idx];
        FOR v_seat_num IN 1..v_seats_per_row LOOP
          IF ((v_row_idx - 1) * v_seats_per_row + v_seat_num) <= v_theatre.total_seats THEN
            INSERT INTO seats (show_id, seat_number, seat_row)
            VALUES (v_show.show_id, v_row_label || v_seat_num, v_row_label)
            ON CONFLICT DO NOTHING;
          END IF;
        END LOOP;
      END LOOP;
    END IF;
  END LOOP;
END;
$$;


INSERT INTO users (first_name, last_name, email, dob, phone, password, role)
VALUES ('Admin', 'User', 'admin@cinebook.com', '1990-01-01', '9876543210', md5('Admin@123'), 'admin')
ON CONFLICT (email) DO NOTHING;
