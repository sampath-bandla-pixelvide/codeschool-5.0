<?php

require_once __DIR__ . '/../utils/db.php';

class Trip {
    private $db;

    public function __construct() {
        $this->db = new DB();
    }

    public function findActiveByVehicle($vehicle_number) {
        return $this->db->first(
            "SELECT * FROM trips WHERE vehicle_number = :v_num AND status = 'active' LIMIT 1",
            [':v_num' => $vehicle_number]
        );
    }

    public function findByToken($token_number) {
        return $this->db->first(
            "SELECT * FROM trips WHERE token_number = :token LIMIT 1",
            [':token' => $token_number]
        );
    }

    public function getActiveTrips() {
        return $this->db->get(
            "SELECT t.*, e.exit_name as entry_point 
             FROM trips t
             JOIN exits e ON t.entry_exit_id = e.id
             WHERE t.status = 'active' ORDER BY t.entry_time DESC"
        );
    }

    public function create($data) {
        return $this->db->run(
            "INSERT INTO trips (token_number, vehicle_number, entry_exit_id, created_by_employee_id) 
             VALUES (:token, :v_num, :entry_id, :emp_id)",
            [
                ':token' => $data['token_number'],
                ':v_num' => $data['vehicle_number'],
                ':entry_id' => $data['entry_exit_id'],
                ':emp_id' => $data['created_by_employee_id']
            ]
        );
    }

    public function complete($id, $data) {
        return $this->db->run(
            "UPDATE trips SET 
             exit_exit_id = :exit_id, 
             exit_time = CURRENT_TIMESTAMP, 
             amount = :amount, 
             payment_status = 'paid', 
             payment_method = :pay_method, 
             status = 'completed', 
             closed_by_employee_id = :emp_id 
             WHERE id = :id AND status = 'active'",
            [
                ':id' => $id,
                ':exit_id' => $data['exit_exit_id'],
                ':amount' => $data['amount'],
                ':pay_method' => $data['payment_method'],
                ':emp_id' => $data['closed_by_employee_id']
            ]
        );
    }

    public function getDailyReport($date) {
        return $this->db->first(
            "SELECT COUNT(*) as total_trips, SUM(amount) as total_revenue 
             FROM trips 
             WHERE DATE(exit_time) = :date AND status = 'completed'",
            [':date' => $date]
        );
    }

    public function getEmployeeCollections() {
        return $this->db->get(
            "SELECT u.name as employee_name, SUM(t.amount) as total_collected, COUNT(t.id) as trips_closed
             FROM trips t
             JOIN users u ON t.closed_by_employee_id = u.id
             WHERE t.status = 'completed'
             GROUP BY u.id, u.name
             ORDER BY total_collected DESC"
        );
    }
}
