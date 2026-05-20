<?php

require_once __DIR__ . '/../utils/db.php';

class TollRate {
    private $db;

    public function __construct() {
        $this->db = new DB();
    }

    public function getAll() {
        return $this->db->get("SELECT tr.*, e1.exit_name as entry_name, e2.exit_name as destination_name 
                               FROM toll_rates tr
                               JOIN exits e1 ON tr.entry_exit_id = e1.id
                               JOIN exits e2 ON tr.destination_exit_id = e2.id
                               ORDER BY e1.exit_name, e2.exit_name");
    }

    public function findById($id)
    {
        return $this->db->first(
            "SELECT *
            FROM toll_rates
            WHERE id = :id
            LIMIT 1",
            [
                ':id' => $id
            ]
        );
    }
    
    public function findByRoute($entry_id, $destination_id) {
        return $this->db->first(
            "SELECT * FROM toll_rates WHERE entry_exit_id = :entry_id AND destination_exit_id = :destination_id LIMIT 1",
            [':entry_id' => $entry_id, ':destination_id' => $destination_id]
        );
    }

    public function create($data) {
        return $this->db->run(
            "INSERT INTO toll_rates (entry_exit_id, destination_exit_id, amount) VALUES (:entry_id, :dest_id, :amount)",
            [
                ':entry_id' => $data['entry_exit_id'],
                ':dest_id' => $data['destination_exit_id'],
                ':amount' => $data['amount']
            ]
        );
    }

    public function update($id, $data) {
        return $this->db->run(
            "UPDATE toll_rates SET amount = :amount WHERE id = :id",
            [':id' => $id, ':amount' => $data['amount']]
        );
    }

    public function delete($id) {
        return $this->db->run("DELETE FROM toll_rates WHERE id = :id", [':id' => $id]);
    }
}
