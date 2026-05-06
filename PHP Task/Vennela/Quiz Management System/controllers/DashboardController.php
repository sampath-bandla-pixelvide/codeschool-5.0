<?php
require_once __DIR__ . "/../utils/pdo.php";

class DashboardController {
    private $pdo;
    public function __construct() {
        $this->pdo = getPDO();
    }
    public function getDashboardData() {
        $subjects = $this->pdo->query("SELECT COUNT(*) FROM subjects")->fetchColumn();
        $quizzes = $this->pdo->query("SELECT COUNT(*) FROM quizzes")->fetchColumn();
        $users = $this->pdo->query("SELECT COUNT(*) FROM users WHERE role = 'user'")->fetchColumn();
        $stmt = $this->pdo->query("SELECT name, email FROM users ORDER BY id DESC LIMIT 5");
        $userList = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return [
            "subjects" => $subjects,
            "quizzes" => $quizzes,
            "users" => $users,
            "userList" => $userList
        ];
    }
}