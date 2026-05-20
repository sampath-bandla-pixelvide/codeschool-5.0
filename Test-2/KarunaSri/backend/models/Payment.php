<?php

require_once __DIR__ . '/../utils/db.php';

class Payment {
    private $db;

    public function __construct() {
        $this->db = new DB();
    }

    public function create($data) {
        return $this->db->run(
            "INSERT INTO payments (trip_id, amount, payment_method, collected_by_employee_id) 
             VALUES (:trip_id, :amount, :method, :emp_id)",
            [
                ':trip_id' => $data['trip_id'],
                ':amount' => $data['amount'],
                ':method' => $data['payment_method'],
                ':emp_id' => $data['collected_by_employee_id']
            ]
        );
    }
}
