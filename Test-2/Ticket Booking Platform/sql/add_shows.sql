-- Active: 1775629722491@@127.0.0.1@5432@sample@public

INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price) VALUES
  (3, 2, CURRENT_DATE + 2, '10:00', 240.00),
  (3, 3, CURRENT_DATE + 2, '14:00', 200.00),
  (3, 4, CURRENT_DATE + 3, '19:30', 320.00)
ON CONFLICT DO NOTHING;

INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price) VALUES
  (4, 1, CURRENT_DATE + 2, '11:00', 220.00),
  (4, 3, CURRENT_DATE + 3, '15:00', 190.00),
  (4, 4, CURRENT_DATE + 4, '18:00', 280.00)
ON CONFLICT DO NOTHING;

INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price) VALUES
  (5, 1, CURRENT_DATE + 1, '13:00', 350.00),
  (5, 2, CURRENT_DATE + 2, '16:00', 300.00),
  (5, 3, CURRENT_DATE + 3, '20:00', 380.00)
ON CONFLICT DO NOTHING;

INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price) VALUES
  (6, 1, CURRENT_DATE + 2, '14:00', 180.00),
  (6, 2, CURRENT_DATE + 3, '11:00', 160.00),
  (6, 4, CURRENT_DATE + 5, '17:00', 200.00)
ON CONFLICT DO NOTHING;
