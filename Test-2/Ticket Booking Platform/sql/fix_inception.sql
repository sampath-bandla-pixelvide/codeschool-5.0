-- Active: 1775629722491@@127.0.0.1@5432@sample@public
INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price) VALUES
  (1, 3, CURRENT_DATE + 2, '13:30', 260.00),
  (1, 4, CURRENT_DATE + 3, '21:00', 330.00)
ON CONFLICT DO NOTHING;
