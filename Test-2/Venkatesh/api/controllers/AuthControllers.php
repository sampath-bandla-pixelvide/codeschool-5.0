<?php

require_once(__DIR__ . "/../utils/db.php");
require_once(__DIR__ . "/../utils/functions.php");

class AuthControllers
{
    private $db;

    public function __construct()
    {
        $this->db = new DB();
    }

    // registration

    public function register($first_name, $last_name, $email, $phone, $pan, $dob, $password)
    {
        $first_name = trim($first_name);
        $last_name  = trim($last_name);
        $email      = trim($email);
        $phone      = trim($phone);
        $pan        = strtoupper(trim($pan));
        $dob        = trim($dob);
        $password   = trim($password);

        if ($first_name == "") {
            sendResponse(false, "First name is required");
        }

        if (strlen($first_name) < 3) {
            sendResponse(false, "First name must be at least 3 characters");
        }

        if ($last_name == "") {
            sendResponse(false, "Last name is required");
        }

        if (strlen($last_name) < 3) {
            sendResponse(false, "Last name must be at least 3 characters");
        }

        if ($email == "") {
            sendResponse(false, "Email is required");
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, "Invalid email format");
        }

        if ($phone == "") {
            sendResponse(false, "Phone is required");
        }

        if (!preg_match("/^[6-9][0-9]{9}$/", $phone)) {
            sendResponse(false, "Enter valid 10 digit phone number");
        }

        if ($pan == "") {
            sendResponse(false, "PAN is required");
        }

        if (!preg_match("/^[A-Z]{5}[0-9]{4}[A-Z]$/", $pan)) {
            sendResponse(false, "Invalid PAN format");
        }

        if ($dob == "") {
            sendResponse(false, "Date of birth is required");
        }

        if ($password == "") {
            sendResponse(false, "Password is required");
        }

        if (strlen($password) < 6 || strlen($password) > 25) {
            sendResponse(false, "Password must be 6 to 25 characters");
        }

        $existingUser = $this->db
            ->query("
                SELECT id FROM users
                WHERE email = :email
                OR phone = :phone
                OR pan = :pan
            ")
            ->first([
                "email" => $email,
                "phone" => $phone,
                "pan" => $pan
            ]);

        if ($existingUser) {
            sendResponse(false, "Email, phone or PAN already registered");
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $this->db
            ->query("
                INSERT INTO users
                (first_name, last_name, email, phone, pan, dob, password)
                VALUES
                (:first_name, :last_name, :email, :phone, :pan, :dob, :password)
            ")
            ->create([
                "first_name" => $first_name,
                "last_name" => $last_name,
                "email" => $email,
                "phone" => $phone,
                "pan" => $pan,
                "dob" => $dob,
                "password" => $hashedPassword
            ]);

        sendResponse(true, "Registration successful");
    }

    // login 
    public function login($email, $password)
    {
        $email = trim($email);
        $password = trim($password);

        if ($email == "") {
            sendResponse(false, "Email is required");
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, "Invalid email format");
        }

        if ($password == "") {
            sendResponse(false, "Password is required");
        }

        $user = $this->db
            ->query("SELECT * FROM users WHERE email = :email")
            ->first([
                "email" => $email
            ]);

        if (!$user) {
            sendResponse(false, "Invalid email or password");
        }

        if (!password_verify($password, $user["password"])) {
            sendResponse(false, "Invalid email or password");
        }

        $token = bin2hex(random_bytes(10));
        $expiry_at = date("Y-m-d H:i:s", strtotime("+1 hour"));

        $this->db
            ->query("
                INSERT INTO user_tokens
                (user_id, token, expiry_at,status)
                VALUES
                (:user_id, :token, :expiry_at, true)
            ")
            ->create([
                "user_id" => $user["id"],
                "token" => $token,
                "expiry_at" => $expiry_at
            ]);

        $data = [
            "token" => $token,
            "user" => [
                "id" => $user["id"],
                "first_name" => $user["first_name"],
                "last_name" => $user["last_name"],
                "email" => $user["email"],
                "role" => $user["role"]
            ]
        ];

        sendResponse(true, "Login successful", $data);
    }

    // logout function
    public function logout($token)
    {
        $token = trim($token);

        if ($token == "") {
            sendResponse(false, "Token missing");
        }

        $this->db
            ->query("
            UPDATE user_tokens
            SET status = false
            WHERE token = :token
        ")
            ->update([
                "token" => $token
            ]);

        sendResponse(true, "Logout successful");
    }

    // forgot password
    public function forgotPassword($email)
    {
        $email = trim($email);

        if ($email == "") {
            sendResponse(false, "Email is required");
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, "Invalid email format");
        }

        $user = $this->db
            ->query("
            SELECT id FROM users
            WHERE email = :email
        ")
            ->first([
                "email" => $email
            ]);

        if (!$user) {
            sendResponse(false, "Email not registered");
        }

        $otp = rand(100000, 999999);

        $expiry_at = date(
            "Y-m-d H:i:s",
            strtotime("+1 minute")
        );

        $this->db
            ->query("
            INSERT INTO forgot_password_tokens
            (user_id, otp, expiry_at)
            VALUES
            (:user_id, :otp, :expiry_at)
        ")
            ->create([
                "user_id" => $user["id"],
                "otp" => $otp,
                "expiry_at" => $expiry_at
            ]);

        sendResponse(true, "OTP sent successfully", [
            "otp" => $otp
        ]);
    }

    // reset password
    public function resetPassword($email, $otp, $password)
    {
        $email = trim($email);
        $otp = trim($otp);
        $password = trim($password);

        if ($email == "") {
            sendResponse(false, "Email is required");
        }

        if ($otp == "") {
            sendResponse(false, "OTP is required");
        }

        if ($password == "") {
            sendResponse(false, "Password is required");
        }

        $user = $this->db
            ->query("
            SELECT id FROM users
            WHERE email = :email
        ")
            ->first([
                "email" => $email
            ]);

        if (!$user) {
            sendResponse(false, "Invalid email");
        }

        $otpData = $this->db
            ->query("
            SELECT *
            FROM forgot_password_tokens
            WHERE user_id = :user_id
            AND otp = :otp
            AND is_used = false
            ORDER BY id DESC
            LIMIT 1
        ")
            ->first([
                "user_id" => $user["id"],
                "otp" => $otp
            ]);

        if (!$otpData) {
            sendResponse(false, "Invalid OTP");
        }

        if (strtotime($otpData["expiry_at"]) < time()) {
            sendResponse(false, "OTP expired");
        }

        $hashedPassword = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $this->db
            ->query("
            UPDATE users
            SET password = :password
            WHERE id = :id
        ")
            ->update([
                "password" => $hashedPassword,
                "id" => $user["id"]
            ]);

        $this->db
            ->query("
            UPDATE forgot_password_tokens
            SET is_used = true
            WHERE id = :id
        ")
            ->update([
                "id" => $otpData["id"]
            ]);

        sendResponse(true, "Password reset successful");
    }

    // verify the token in dashboard page 
    public function verifyToken($token)
    {
        $token = trim($token);

        if ($token == "") {
            sendResponse(false, "Token missing");
        }

        $tokenData = $this->db
            ->query("
            SELECT ut.*, u.id as user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.role
            FROM user_tokens ut
            JOIN users u
            ON u.id = ut.user_id
            WHERE ut.token = :token
            AND ut.status = true
            LIMIT 1
        ")
            ->first([
                "token" => $token
            ]);

        if (!$tokenData) {
            sendResponse(false, "Invalid token");
        }

        if (strtotime($tokenData["expiry_at"]) < time()) {

            $this->db
                ->query("
                UPDATE user_tokens SET status = false WHERE id = :id
            ")
                ->update([
                    "id" => $tokenData["id"]
                ]);

            sendResponse(false, "Token expired");
        }

        sendResponse(true, "Token valid", [
            "user" => [
                "id" => $tokenData["user_id"],
                "first_name" => $tokenData["first_name"],
                "last_name" => $tokenData["last_name"],
                "email" => $tokenData["email"],
                "role" => $tokenData["role"]
            ]
        ]);
    }
}
