<?php

  require_once __DIR__ . "/../utils/db.php";
  require_once __DIR__ . "/../utils/functions.php";

  class dashboardController {
    private $db = null;

    function __construct()
    {
        $this->db = new DB();
    }

    public function getUser($user_id) {
        $this->db->query("SELECT first_name, email,role FROM users WHERE id = :id");
        return $this->db->first(["id" => $user_id]);
    }

    public function getStats() {
        $this->db->query("SELECT COUNT(*) as count FROM users");
        $users = $this->db->first();

        $this->db->query("SELECT COUNT(*) as count FROM orders");
        $orders = $this->db->first();

        $this->db->query("SELECT SUM(total_amount) as total FROM orders");
        $revenue = $this->db->first();

        $this->db->query("SELECT COUNT(*) as count FROM orders WHERE order_status = :status");
        $pending = $this->db->first(["status" => "processing"]);

        return [
            "users" => $users['count'] ?? 0,
            "orders" => $orders['count'] ?? 0,
            "revenue" => $revenue['total'] ?? 0,
            "pending" => $pending['count'] ?? 0
        ];
    }

}