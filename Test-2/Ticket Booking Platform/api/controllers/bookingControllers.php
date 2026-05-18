<?php
require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";
class BookingController
{
    public $db = null;
    function __construct()
    {
        $this->db = new DB();
    }
    public function getUserIdFromToken($token)
    {
        $query = "SELECT user_id FROM user_tokens WHERE token = :token AND is_active = true AND expires_at > CURRENT_TIMESTAMP";
        $this->db->query($query);
        $row = $this->db->first([':token' => $token]);
        return $row ? $row['user_id'] : null;
    }
    public function getUserRoleFromToken($token)
    {
        $query = "SELECT u.role FROM users u
                  JOIN user_tokens ut ON ut.user_id = u.id
                  WHERE ut.token = :token AND ut.is_active = true AND ut.expires_at > CURRENT_TIMESTAMP";
        $this->db->query($query);
        $row = $this->db->first([':token' => $token]);
        return $row ? $row['role'] : null;
    }
    private function generateReference()
    {
        do {
            $ref = 'BKG-' . strtoupper(generateRandomString(8));
            $this->db->query("SELECT id FROM bookings WHERE reference_number = :ref");
            $exists = $this->db->first([':ref' => $ref]);
        } while ($exists);
        return $ref;
    }
    public function createBooking($userId, $showId, $seatIds)
    {
        if (empty($seatIds) || !is_array($seatIds)) {
            return sendResponse(false, "Please select at least one seat");
        }
        $seatIdList = implode(',', array_map('intval', $seatIds));
        $checkQuery = "SELECT id, seat_number FROM seats WHERE id IN ({$seatIdList}) AND is_booked = true";
        $this->db->query($checkQuery);
        $alreadyBooked = $this->db->get();
        if (!empty($alreadyBooked)) {
            $seatNums = array_column($alreadyBooked, 'seat_number');
            return sendResponse(false, "Seats already booked: " . implode(', ', $seatNums));
        }
        $this->db->query("SELECT price FROM shows WHERE id = :show_id");
        $show = $this->db->first([':show_id' => $showId]);
        if (!$show) {
            return sendResponse(false, "Show not found");
        }
        $totalAmount = $show['price'] * count($seatIds);
        $reference   = $this->generateReference();
        $this->db->query("INSERT INTO bookings (user_id, show_id, reference_number, total_amount)
                          VALUES (:user_id, :show_id, :reference_number, :total_amount)
                          RETURNING id");
        $booking = $this->db->first([
            ':user_id'          => $userId,
            ':show_id'          => $showId,
            ':reference_number' => $reference,
            ':total_amount'     => $totalAmount,
        ]);
        if (!$booking) {
            return sendResponse(false, "Booking failed");
        }
        $bookingId = $booking['id'];
        foreach ($seatIds as $seatId) {
            $this->db->query("INSERT INTO booking_seats (booking_id, seat_id) VALUES (:booking_id, :seat_id) ON CONFLICT DO NOTHING");
            $this->db->create([':booking_id' => $bookingId, ':seat_id' => (int)$seatId]);
            $this->db->query("UPDATE seats SET is_booked = true WHERE id = :seat_id");
            $this->db->update([':seat_id' => (int)$seatId]);
        }
        return sendResponse(true, "Booking confirmed!", [
            'reference_number' => $reference,
            'total_amount'     => $totalAmount,
            'seat_count'       => count($seatIds),
        ]);
    }
    public function listMyBookings($userId)
    {
        $query = "SELECT b.reference_number, b.total_amount, b.status, b.booking_date,
                         m.title AS movie_title, m.poster_url,
                         t.name AS theatre_name, t.location,
                         s.show_date, s.show_time,
                         STRING_AGG(se.seat_number, ', ' ORDER BY se.seat_number) AS seats
                  FROM bookings b
                  JOIN shows s       ON s.id = b.show_id
                  JOIN movies m      ON m.id = s.movie_id
                  JOIN theatres t    ON t.id = s.theatre_id
                  JOIN booking_seats bs ON bs.booking_id = b.id
                  JOIN seats se      ON se.id = bs.seat_id
                  WHERE b.user_id = :user_id
                  GROUP BY b.id, b.reference_number, b.total_amount, b.status, b.booking_date,
                           m.title, m.poster_url, t.name, t.location, s.show_date, s.show_time
                  ORDER BY b.booking_date DESC";
        $this->db->query($query);
        $rows = $this->db->get([':user_id' => $userId]);
        return sendResponse(true, "Bookings fetched", $rows);
    }
    public function adminListBookings()
    {
        $query = "SELECT b.reference_number, b.total_amount, b.status, b.booking_date,
                         u.first_name, u.last_name, u.email,
                         m.title AS movie_title,
                         t.name AS theatre_name,
                         s.show_date, s.show_time,
                         STRING_AGG(se.seat_number, ', ' ORDER BY se.seat_number) AS seats,
                         COUNT(se.id) AS seat_count
                  FROM bookings b
                  JOIN users u       ON u.id = b.user_id
                  JOIN shows s       ON s.id = b.show_id
                  JOIN movies m      ON m.id = s.movie_id
                  JOIN theatres t    ON t.id = s.theatre_id
                  JOIN booking_seats bs ON bs.booking_id = b.id
                  JOIN seats se      ON se.id = bs.seat_id
                  GROUP BY b.id, b.reference_number, b.total_amount, b.status, b.booking_date,
                           u.first_name, u.last_name, u.email,
                           m.title, t.name, s.show_date, s.show_time
                  ORDER BY b.booking_date DESC";
        $this->db->query($query);
        $rows = $this->db->get();
        return sendResponse(true, "All bookings fetched", $rows);
    }
    public function adminListShows()
    {
        $query = "SELECT s.id, s.show_date, s.show_time, s.price, s.movie_id, s.theatre_id,
                         m.title AS movie_title,
                         t.name AS theatre_name, t.location,
                         t.total_seats,
                         COUNT(CASE WHEN se.is_booked THEN 1 END) AS booked_seats
                  FROM shows s
                  JOIN movies m ON m.id = s.movie_id
                  JOIN theatres t ON t.id = s.theatre_id
                  LEFT JOIN seats se ON se.show_id = s.id
                  GROUP BY s.id, s.show_date, s.show_time, s.price, s.movie_id, s.theatre_id, m.title, t.name, t.location, t.total_seats
                  ORDER BY s.show_date DESC, s.show_time";
        $this->db->query($query);
        $rows = $this->db->get();
        return sendResponse(true, "Shows fetched", $rows);
    }
}
