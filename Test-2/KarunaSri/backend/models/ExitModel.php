<?php

require_once __DIR__ . '/../utils/db.php';

class ExitModel {
    private $db;

    public function __construct() {
        $this->db = new DB();
    }

    public function getAll() {
        return $this->db->get("SELECT * FROM exits ORDER BY exit_name ASC");
    }

    public function findById($id) {
        return $this->db->first("SELECT * FROM exits WHERE id = :id LIMIT 1", [':id' => $id]);
    }

    public function create($data) {
        return $this->db->run(
            "INSERT INTO exits (exit_name, location) VALUES (:exit_name, :location)",
            [
                ':exit_name' => $data['exit_name'],
                ':location' => $data['location']
            ]
        );
    }

    public function update($id, $data) {
        return $this->db->run(
            "UPDATE exits SET exit_name = :exit_name, location = :location WHERE id = :id",
            [
                ':id' => $id,
                ':exit_name' => $data['exit_name'],
                ':location' => $data['location']
            ]
        );
    }

    public function delete($id) {
        return $this->db->run("DELETE FROM exits WHERE id = :id", [':id' => $id]);
    }
}
