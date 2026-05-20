<?php

require_once __DIR__ . '/../utils/db.php';

class User {
    private $db;

    public function __construct() {
        $this->db = new DB();
    }

    public function findByEmail($email) {
        return $this->db->first(
            "SELECT * FROM users WHERE email = :email LIMIT 1",
            [':email' => $email]
        );
    }

    public function findById($id) {
        return $this->db->first(
            "SELECT 
                id,
                first_name || ' ' || last_name AS name,
                email,
                role,
                assigned_exit_id,
                is_active
             FROM users
             WHERE id = :id
             LIMIT 1",
            [':id' => $id]
        );
    }

    public function getAll() {
        return $this->db->get(
            "SELECT 
                id,
                first_name,
                last_name,
                first_name || ' ' || last_name AS name,
                email,
                role,
                assigned_exit_id,
                is_active
             FROM users
             WHERE role != 'admin'
             ORDER BY created_at DESC"
        );
    }

    public function create($data) {
        $sql = "INSERT INTO users 
                (first_name, last_name, email, password, role, assigned_exit_id) 
                VALUES 
                (:first_name, :last_name, :email, :password, :role, :assigned_exit_id)";

        return $this->db->run($sql, [
            ':first_name' => $data['first_name'],
            ':last_name' => $data['last_name'],
            ':email' => $data['email'],
            ':password' => $data['password'],
            ':role' => $data['role'],
            ':assigned_exit_id' => $data['assigned_exit_id']
        ]);
    }

    public function update($id, $data) {
        $sql = "UPDATE users 
                SET 
                    first_name = :first_name,
                    last_name = :last_name,
                    email = :email,
                    role = :role,
                    assigned_exit_id = :assigned_exit_id,
                    is_active = :is_active
                WHERE id = :id";

        return $this->db->run($sql, [
            ':id' => $id,
            ':first_name' => $data['first_name'],
            ':last_name' => $data['last_name'],
            ':email' => $data['email'],
            ':role' => $data['role'],
            ':assigned_exit_id' => $data['assigned_exit_id'],
            ':is_active' => $data['is_active']
        ]);
    }

    public function delete($id) {
        return $this->db->run(
            "DELETE FROM users WHERE id = :id",
            [':id' => $id]
        );
    }
}