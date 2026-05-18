-- Active: 1775629722491@@127.0.0.1@5432@sample@public
DELETE FROM seats WHERE id NOT IN (
  SELECT MIN(id) FROM seats GROUP BY show_id, seat_number
);


INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price) VALUES
  (2, 1, CURRENT_DATE + 2, '12:00', 230.00),
  (2, 2, CURRENT_DATE + 3, '17:00', 210.00)
ON CONFLICT DO NOTHING;
