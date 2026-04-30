<?php

require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";

class AuthController {

    private $db;

    public function __construct() {
        $this->db = new DB();
    }

   public function sendOtp($email, $name) {

    $this->db->query("SELECT * FROM users WHERE email = :email");
    $user = $this->db->first(['email' => $email]);

    if (!$user) {
        $this->db->query("INSERT INTO users (email, name) VALUES (:email, :name)");
        $this->db->create([
            'email' => $email,
            'name' => $name
        ]);
        $user_id = $this->db->lastInsertId();
    } else {
        $user_id = $user['id'];

        
        if ($name) {
            $this->db->query("UPDATE users SET name = :name WHERE id = :id");
            $this->db->update([
                'name' => $name,
                'id' => $user_id
            ]);
        }
    }

    
    $otp = rand(1000, 9999);
    
    // $this->db->query("DELETE FROM user_otp WHERE user_id = :user_id");
    // $this->db->delete(['user_id' => $user_id]);

    $this->db->query("
        INSERT INTO user_otp (user_id, otp, expiry_timestamp)
        VALUES (:user_id, :otp, NOW() + INTERVAL '120 seconds')
    ");
    $this->db->create([
        'user_id' => $user_id,
        'otp' => $otp,
    ]);

    sendResponse(true, "OTP sent successfully",['otp' => $otp]);
}


public function verifyOtp($email, $otp, $name = null)
{
    session_start();

    
    $this->db->query("SELECT * FROM users WHERE email = :email");
    $user = $this->db->first(['email' => $email]);

    if (!$user) {
        sendResponse(false, "User not found");
    }

    $this->db->query("
        SELECT * FROM user_otp
        WHERE user_id = :user_id 
        AND otp = :otp 
        AND expiry_timestamp > NOW()
    ");

    $valid = $this->db->first([
        'user_id' => $user['id'],
        'otp' => $otp
    ]);

    if (!$valid) {
        sendResponse(false, "Invalid or expired OTP");
    }


    if (empty($user['name']) && $name) {
        $this->db->query("UPDATE users SET name = :name WHERE id = :id");
        $this->db->update([
            'name' => $name,
            'id' => $user['id']
        ]);
    }


    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email']   = $user['email'];
    $_SESSION['name']    = $name ?? $user['name'];
     
    
    // $this->db->query("DELETE FROM user_otp WHERE user_id = :user_id");
    // $this->db->delete(['user_id' => $user['id']]);


    $this->db->query("UPDATE user_otp SET status = false WHERE user_id = :user_id");
    $this->db->update([
        'user_id' => $user['id'],
    ]);

    sendResponse(true, "Login successful"); 
}

    // public function logout() {
    //     session_start();
    //     session_destroy();
    //     return ["success" => true];
    // }
}