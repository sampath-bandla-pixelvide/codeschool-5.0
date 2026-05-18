<?php
require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";
class MovieController
{
    public $db = null;
    function __construct()
    {
        $this->db = new DB();
    }
    public function listMovies($genreId = null)
    {
        if ($genreId) {
            $query = "SELECT m.id, m.title, m.description, m.duration_mins, m.poster_url,
                             m.language, m.release_date, m.rating, m.genre_id, g.name AS genre_name
                      FROM movies m
                      LEFT JOIN genres g ON g.id = m.genre_id
                      WHERE m.genre_id = :genre_id
                      ORDER BY m.created_at DESC";
            $this->db->query($query);
            $rows = $this->db->get([':genre_id' => $genreId]);
        } else {
            $query = "SELECT m.id, m.title, m.description, m.duration_mins, m.poster_url,
                             m.language, m.release_date, m.rating, m.genre_id, g.name AS genre_name
                      FROM movies m
                      LEFT JOIN genres g ON g.id = m.genre_id
                      ORDER BY m.created_at DESC";
            $this->db->query($query);
            $rows = $this->db->get();
        }

        // Fetch carousel images for all movies
        $imgQuery = "SELECT movie_id, image_url FROM movie_carousel_images ORDER BY id ASC";
        $this->db->query($imgQuery);
        $allImgs = $this->db->get();
        
        $imagesByMovie = [];
        if ($allImgs) {
            foreach ($allImgs as $img) {
                $imagesByMovie[$img['movie_id']][] = $img['image_url'];
            }
        }

        foreach ($rows as &$movie) {
            $movie['carousel_images'] = isset($imagesByMovie[$movie['id']]) ? $imagesByMovie[$movie['id']] : [];
        }

        return sendResponse(true, "Movies fetched", $rows);
    }
    public function getMovie($movieId)
    {
        $query = "SELECT m.id, m.title, m.description, m.duration_mins, m.poster_url,
                         m.language, m.release_date, m.rating, g.name AS genre_name
                  FROM movies m
                  LEFT JOIN genres g ON g.id = m.genre_id
                  WHERE m.id = :id";
        $this->db->query($query);
        $movie = $this->db->first([':id' => $movieId]);
        if (!$movie) {
            return sendResponse(false, "Movie not found");
        }
        $actorQuery = "SELECT a.id, a.name, a.photo_url
                       FROM actors a
                       JOIN movie_actors ma ON ma.actor_id = a.id
                       WHERE ma.movie_id = :movie_id";
        $this->db->query($actorQuery);
        $movie['actors'] = $this->db->get([':movie_id' => $movieId]);

        $imgQuery = "SELECT image_url FROM movie_carousel_images WHERE movie_id = :movie_id ORDER BY id ASC";
        $this->db->query($imgQuery);
        $imgs = $this->db->get([':movie_id' => $movieId]);
        $movie['carousel_images'] = array_column($imgs, 'image_url');
        
        // Fallback: if no carousel images, use poster if it exists
        if (empty($movie['carousel_images']) && !empty($movie['poster_url'])) {
            $movie['carousel_images'] = [$movie['poster_url']];
        }

        return sendResponse(true, "Movie fetched", $movie);
    }
    public function listTheatresForMovie($movieId)
    {
        $query = "SELECT DISTINCT t.id, t.name, t.location, t.total_seats
                  FROM theatres t
                  JOIN shows s ON s.theatre_id = t.id
                  WHERE s.movie_id = :movie_id
                  ORDER BY t.name";
        $this->db->query($query);
        $rows = $this->db->get([':movie_id' => $movieId]);
        return sendResponse(true, "Theatres fetched", $rows);
    }
    public function listShowDates($movieId, $theatreId)
    {
        $query = "SELECT DISTINCT show_date
                  FROM shows
                  WHERE movie_id = :movie_id AND theatre_id = :theatre_id
                  ORDER BY show_date";
        $this->db->query($query);
        $rows = $this->db->get([':movie_id' => $movieId, ':theatre_id' => $theatreId]);
        return sendResponse(true, "Dates fetched", $rows);
    }
    public function listShows($movieId, $theatreId, $showDate)
    {
        $query = "SELECT s.id, s.show_time, s.price,
                         (t.total_seats - COUNT(CASE WHEN se.is_booked THEN 1 END)) AS available_seats
                  FROM shows s
                  JOIN theatres t ON t.id = s.theatre_id
                  LEFT JOIN seats se ON se.show_id = s.id
                  WHERE s.movie_id = :movie_id AND s.theatre_id = :theatre_id AND s.show_date = :show_date
                  GROUP BY s.id, s.show_time, s.price, t.total_seats
                  ORDER BY s.show_time";
        $this->db->query($query);
        $rows = $this->db->get([
            ':movie_id'   => $movieId,
            ':theatre_id' => $theatreId,
            ':show_date'  => $showDate,
        ]);
        return sendResponse(true, "Shows fetched", $rows);
    }
    public function listSeats($showId)
    {
        $query = "SELECT id, seat_number, seat_row, is_booked
                  FROM seats
                  WHERE show_id = :show_id
                  ORDER BY seat_row, seat_number";
        $this->db->query($query);
        $rows = $this->db->get([':show_id' => $showId]);
        return sendResponse(true, "Seats fetched", $rows);
    }
    public function listGenres()
    {
        $query = "SELECT id, name FROM genres ORDER BY name";
        $this->db->query($query);
        $rows = $this->db->get();
        return sendResponse(true, "Genres fetched", $rows);
    }
    public function listAllTheatres()
    {
        $query = "SELECT id, name, location, total_seats FROM theatres ORDER BY name";
        $this->db->query($query);
        $rows = $this->db->get();
        return sendResponse(true, "Theatres fetched", $rows);
    }
    public function createMovie($title, $description, $durationMins, $posterUrl, $language, $releaseDate, $rating, $genreId)
    {
        $query = "INSERT INTO movies (title, description, duration_mins, poster_url, language, release_date, rating, genre_id)
                  VALUES (:title, :description, :duration_mins, :poster_url, :language, :release_date, :rating, :genre_id)
                  RETURNING id";
        $this->db->query($query);
        $result = $this->db->first([
            ':title'        => $title,
            ':description'  => $description,
            ':duration_mins'=> $durationMins,
            ':poster_url'   => $posterUrl,
            ':language'     => $language,
            ':release_date' => $releaseDate,
            ':rating'       => $rating,
            ':genre_id'     => $genreId,
        ]);
        if (!$result) {
            return false;
        }
        return $result['id'];
    }
    public function addCarouselImage($movieId, $imageUrl)
    {
        $query = "INSERT INTO movie_carousel_images (movie_id, image_url) VALUES (:movie_id, :image_url)";
        $this->db->query($query);
        $this->db->create([
            ':movie_id' => $movieId,
            ':image_url' => $imageUrl
        ]);
    }
    public function createTheatre($name, $location, $totalSeats)
    {
        $query = "INSERT INTO theatres (name, location, total_seats)
                  VALUES (:name, :location, :total_seats)";
        $this->db->query($query);
        $result = $this->db->create([
            ':name'        => $name,
            ':location'    => $location,
            ':total_seats' => $totalSeats,
        ]);
        if (!$result) {
            return sendResponse(false, "Failed to create theatre");
        }
        return sendResponse(true, "Theatre created successfully");
    }
    public function createShow($movieId, $theatreId, $showDate, $showTime, $price)
    {
        $query = "INSERT INTO shows (movie_id, theatre_id, show_date, show_time, price)
                  VALUES (:movie_id, :theatre_id, :show_date, :show_time, :price)
                  RETURNING id";
        $this->db->query($query);
        $result = $this->db->first([
            ':movie_id'   => $movieId,
            ':theatre_id' => $theatreId,
            ':show_date'  => $showDate,
            ':show_time'  => $showTime,
            ':price'      => $price,
        ]);
        if (!$result) {
            return sendResponse(false, "Failed to create show");
        }
        $showId = $result['id'];
        $theatreQuery = "SELECT total_seats FROM theatres WHERE id = :id";
        $this->db->query($theatreQuery);
        $theatre = $this->db->first([':id' => $theatreId]);
        $totalSeats = $theatre['total_seats'];
        $rows = ['A','B','C','D','E','F','G','H','I','J'];
        $seatsPerRow = (int)ceil($totalSeats / 10);
        $seatInsertQuery = "INSERT INTO seats (show_id, seat_number, seat_row) VALUES (:show_id, :seat_number, :seat_row) ON CONFLICT DO NOTHING";
        $seatCount = 0;
        foreach ($rows as $idx => $rowLabel) {
            for ($seatNum = 1; $seatNum <= $seatsPerRow; $seatNum++) {
                if ($seatCount >= $totalSeats) break 2;
                $this->db->query($seatInsertQuery);
                $this->db->create([
                    ':show_id'     => $showId,
                    ':seat_number' => $rowLabel . $seatNum,
                    ':seat_row'    => $rowLabel,
                ]);
                $seatCount++;
            }
        }
        return sendResponse(true, "Show created with {$seatCount} seats");
    }

    public function updateMovie($id, $title, $description, $durationMins, $posterUrl, $language, $releaseDate, $rating, $genreId) {
        $query = "UPDATE movies SET title = :title, description = :description, duration_mins = :duration_mins, 
                  poster_url = :poster_url, language = :language, release_date = :release_date, rating = :rating, genre_id = :genre_id
                  WHERE id = :id";
        $this->db->query($query);
        $result = $this->db->update([
            ':id' => $id,
            ':title' => $title,
            ':description' => $description,
            ':duration_mins' => $durationMins,
            ':poster_url' => $posterUrl,
            ':language' => $language,
            ':release_date' => $releaseDate,
            ':rating' => $rating,
            ':genre_id' => $genreId
        ]);
        return $result !== false;
    }

    public function deleteCarouselImagesForMovie($movieId) {
        $query = "DELETE FROM movie_carousel_images WHERE movie_id = :movie_id";
        $this->db->query($query);
        $this->db->update([':movie_id' => $movieId]);
    }

    public function updateTheatre($id, $name, $location, $totalSeats) {
        $query = "UPDATE theatres SET name = :name, location = :location, total_seats = :total_seats WHERE id = :id";
        $this->db->query($query);
        $result = $this->db->update([
            ':id' => $id,
            ':name' => $name,
            ':location' => $location,
            ':total_seats' => $totalSeats
        ]);
        if (!$result) {
            return sendResponse(false, "Failed to update theatre or no changes made.");
        }
        return sendResponse(true, "Theatre updated successfully.");
    }

    public function updateShow($id, $movieId, $theatreId, $showDate, $showTime, $price) {
        $bookQuery = "SELECT COUNT(*) as count FROM seats WHERE show_id = :show_id AND is_booked = true";
        $this->db->query($bookQuery);
        $res = $this->db->first([':show_id' => $id]);
        
        $currQuery = "SELECT theatre_id FROM shows WHERE id = :id";
        $this->db->query($currQuery);
        $currShow = $this->db->first([':id' => $id]);
        
        if ($res && $res['count'] > 0) {
            if ($currShow && $currShow['theatre_id'] != $theatreId) {
                return sendResponse(false, "Cannot change venue! This show already has active bookings.");
            }
        }

        $query = "UPDATE shows SET movie_id = :movie_id, theatre_id = :theatre_id, show_date = :show_date, show_time = :show_time, price = :price WHERE id = :id";
        $this->db->query($query);
        $result = $this->db->update([
            ':id' => $id,
            ':movie_id' => $movieId,
            ':theatre_id' => $theatreId,
            ':show_date' => $showDate,
            ':show_time' => $showTime,
            ':price' => $price
        ]);

        if ($currShow && $currShow['theatre_id'] != $theatreId) {
            $delQuery = "DELETE FROM seats WHERE show_id = :show_id";
            $this->db->query($delQuery);
            $this->db->update([':show_id' => $id]);

            $theatreQuery = "SELECT total_seats FROM theatres WHERE id = :id";
            $this->db->query($theatreQuery);
            $theatre = $this->db->first([':id' => $theatreId]);
            $totalSeats = $theatre['total_seats'];
            $rows = ['A','B','C','D','E','F','G','H','I','J'];
            $seatsPerRow = (int)ceil($totalSeats / 10);
            $seatInsertQuery = "INSERT INTO seats (show_id, seat_number, seat_row) VALUES (:show_id, :seat_number, :seat_row) ON CONFLICT DO NOTHING";
            $seatCount = 0;
            foreach ($rows as $idx => $rowLabel) {
                for ($seatNum = 1; $seatNum <= $seatsPerRow; $seatNum++) {
                    if ($seatCount >= $totalSeats) break 2;
                    $this->db->query($seatInsertQuery);
                    $this->db->create([
                        ':show_id'     => $id,
                        ':seat_number' => $rowLabel . $seatNum,
                        ':seat_row'    => $rowLabel,
                    ]);
                    $seatCount++;
                }
            }
            return sendResponse(true, "Show updated and seats successfully regenerated.");
        }

        return sendResponse(true, "Show updated successfully.");
    }

    public function deleteShow($id)
    {
        $chkQuery = "SELECT COUNT(*) AS cnt FROM bookings WHERE show_id = :show_id";
        $this->db->query($chkQuery);
        $chk = $this->db->first([':show_id' => $id]);
        if ($chk && $chk['cnt'] > 0) {
            return sendResponse(false, "Cannot delete show. It has active bookings.");
        }

        $query = "DELETE FROM shows WHERE id = :id";
        $this->db->query($query);
        $result = $this->db->delete([':id' => $id]);
        if ($result) {
            return sendResponse(true, "Show deleted successfully.");
        }
        return sendResponse(false, "Failed to delete show.");
    }
}
