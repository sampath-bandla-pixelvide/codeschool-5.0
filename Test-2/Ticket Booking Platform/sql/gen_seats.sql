-- Active: 1775629722491@@127.0.0.1@5432@sample@public
DO $$
DECLARE
  show_rec RECORD;
  theatre_rec RECORD;
  rows TEXT[] := ARRAY['A','B','C','D','E','F','G','H','I','J'];
  row_label TEXT;
  seats_per_row INT;
  seat_count INT;
  seat_num INT;
BEGIN
  FOR show_rec IN
    SELECT s.id AS show_id, s.theatre_id
    FROM shows s
    LEFT JOIN seats se ON se.show_id = s.id
    GROUP BY s.id, s.theatre_id
    HAVING COUNT(se.id) = 0
  LOOP
    SELECT total_seats INTO theatre_rec FROM theatres WHERE id = show_rec.theatre_id;
    seats_per_row := CEIL(theatre_rec.total_seats::FLOAT / 10);
    seat_count := 0;

    FOREACH row_label IN ARRAY rows LOOP
      FOR seat_num IN 1..seats_per_row LOOP
        EXIT WHEN seat_count >= theatre_rec.total_seats;
        INSERT INTO seats (show_id, seat_number, seat_row)
          VALUES (show_rec.show_id, row_label || seat_num, row_label)
          ON CONFLICT DO NOTHING;
        seat_count := seat_count + 1;
      END LOOP;
      EXIT WHEN seat_count >= theatre_rec.total_seats;
    END LOOP;
  END LOOP;
END $$;
