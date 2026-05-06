<?php
require_once(__DIR__ . "/../config/db.php");
require_once(__DIR__ . "/../helpers/functions.php");

class AuthController
{
    private $db;
    function __construct()
    {
        $this->db = new DB();
    }
    public function register($name, $email, $password)
    {
        $existing = $this->db->query("select id from users where email=:email")->first(['email' => $email]);
        if ($existing) throw new Exception("Email already exists");
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $this->db->run(
            "INSERT INTO users (name, email, password) VALUES (:name, :email, :password)",
            [
                'name' => $name,
                'email' => $email,
                'password' => $hashedPassword
            ]
        );
        return true;
    }
    public function login($email, $password)
    {
        $user = $this->db->query("select * from users where email=:email")->first(["email" => $email]);
        if (!$user || !password_verify($password, $user['password']))
            sendResponse(false, "invalid credentials");
        //get token
        $token = bin2hex(random_bytes(32));
        $expiresAt = date("Y-m-d H:i:s", strtotime("+1 day"));
        $this->db->run(
            "INSERT INTO user_tokens (user_id, token_hash, expires_at) 
             VALUES (:user_id, :token_hash, :expires_at)",
            [
                'user_id' => $user['id'],
                'token_hash' => $token,
                'expires_at' => $expiresAt
            ]
        );
        unset($user['password']);
        return ["token" => $token];
    }
}
