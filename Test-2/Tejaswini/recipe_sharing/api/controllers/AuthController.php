<?php

require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";

class AuthController
{
    private $db = null;

    public function __construct()
    {
        $this->db = new DB();
    }

    public function clearExpiredToken()
    {
        $this->db
            ->query("UPDATE user_tokens 
                     SET status=false 
                     WHERE expires_at < CURRENT_TIMESTAMP")
            ->execute();
    }

    public function login($email, $password, $rememberMe)
    {
        $user = $this->db
            ->query("SELECT id, role, password 
                     FROM users 
                     WHERE email=:email 
                     AND status=true")
            ->first([
                ":email" => $email
            ]);

        if (!$user) {
            return sendResponse(false, "Invalid Email or Password");
        }

        if (!password_verify($password, $user['password'])) {
            return sendResponse(false, "Invalid Email or Password");
        }

        $this->db
            ->query("UPDATE user_tokens
                    SET status=false
                    WHERE user_id=:id")
            ->execute([
                ":id" => $user['id']
            ]);
        $token = generateUserToken();

        $this->db
            ->query("INSERT INTO user_tokens (user_id, token) 
                     VALUES (:user_id, :token)")
            ->execute([
                ":user_id" => $user['id'],
                ":token" => $token
            ]);

        if ($rememberMe) {
            $this->db
                ->query("UPDATE user_tokens
                         SET expires_at = CURRENT_TIMESTAMP + INTERVAL '15 days'
                         WHERE token=:token")
                ->execute([
                    ":token" => $token
                ]);
        }

        return sendResponse(true, "Login successful", [
            "token" => $token,
            "isAdmin" => strtoupper($user['role']) === "ADMIN"
        ]);
    }

    public function register(
        $first_name,
        $last_name,
        $email,
        $phone,
        $photo,
        $password
    ) {

        $userExist = $this->db
            ->query("SELECT id 
                     FROM users 
                     WHERE email=:email 
                     OR phone_number=:phone")
            ->first([
                ":email" => $email,
                ":phone" => $phone
            ]);

        if ($userExist) {
            return sendResponse(false, "User already exists");
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $this->db
            ->query("INSERT INTO users
                    (
                        first_name,
                        last_name,
                        email,
                        phone_number,
                        photo,
                        password
                    )
                    VALUES
                    (
                        :first_name,
                        :last_name,
                        :email,
                        :phone,
                        :photo,
                        :password
                    )")
            ->execute([
                ":first_name" => $first_name,
                ":last_name" => $last_name,
                ":email" => $email,
                ":phone" => $phone,
                ":photo" => $photo,
                ":password" => $hashedPassword
            ]);

        return sendResponse(true, "Registration successful");
    }

    public function isUserExist($email, $phone)
    {
        if ($email) {
            $query = "email=:value";
            $value = $email;
        } else if ($phone) {
            $query = "phone_number=:value";
            $value = $phone;
        } else {
            return sendResponse(false, "Invalid parameters");
        }

        $user = $this->db
            ->query("SELECT id FROM users WHERE $query")
            ->first([
                ":value" => $value
            ]);

        if (!$user) {
            return sendResponse(false, "User does not exist");
        }

        return sendResponse(true, "User exists");
    }

    public function getOTP($email)
    {
        $user = $this->db
            ->query("SELECT id 
                     FROM users 
                     WHERE email=:email 
                     AND status=true")
            ->first([
                ":email" => $email
            ]);

        if (!$user) {
            return sendResponse(false, "User not found");
        }

        $this->db
            ->query("UPDATE otps 
                     SET status=false 
                     WHERE email=:email")
            ->execute([
                ":email" => $email
            ]);

        $otp = rand(100000, 999999);

        $this->db
            ->query("INSERT INTO otps (email, otp)
                     VALUES (:email, :otp)")
            ->execute([
                ":email" => $email,
                ":otp" => $otp
            ]);

        return sendResponse(true, "OTP generated", [
            "otp" => $otp
        ]);
    }

    public function verifyOtp($email, $otp)
    {
        $this->db
            ->query("UPDATE otps
                     SET status=false
                     WHERE otp_expires_at < CURRENT_TIMESTAMP")
            ->execute();

        $validOtp = $this->db
            ->query("SELECT id
                     FROM otps
                     WHERE email=:email
                     AND otp=:otp
                     AND status=true")
            ->first([
                ":email" => $email,
                ":otp" => $otp
            ]);

        if (!$validOtp) {
            return sendResponse(false, "Invalid or Expired OTP");
        }

        $this->db
            ->query("UPDATE otps
                     SET status=false
                     WHERE id=:id")
            ->execute([
                ":id" => $validOtp['id']
            ]);

        $user = $this->db
            ->query("SELECT id, role
                 FROM users
                 WHERE email=:email
                 AND status=true")
            ->first([
                ":email" => $email
            ]);
        $token = generateUserToken();

        $this->db
            ->query("INSERT INTO user_tokens
                 (user_id, token)
                 VALUES
                 (:user_id, :token)")
            ->execute([
                ":user_id" => $user['id'],
                ":token" => $token
            ]);

        return sendResponse(true, "OTP verified", [
            "token" => $token
        ]);

        // return sendResponse(true, "OTP verified");
    }

    public function validateToken($token)
    {
        $user = $this->db
            ->query("SELECT u.id,
                            u.first_name,
                            u.last_name,
                            u.email,
                            u.role
                     FROM user_tokens ut
                     INNER JOIN users u
                     ON ut.user_id = u.id
                     WHERE ut.token=:token
                     AND ut.status=true
                     AND ut.expires_at > CURRENT_TIMESTAMP")
            ->first([
                ":token" => $token
            ]);

        if (!$user) {
            return sendResponse(false, "Invalid or Expired Token");
        }

        return sendResponse(true, "Valid Token", $user);
    }

    public function logout($userId)
    {
        $this->db
            ->query("UPDATE user_tokens
                 SET status=false
                 WHERE user_id=:user_id")
            ->execute([
                ":user_id" => $userId
            ]);

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        session_unset();
        session_destroy();

        return sendResponse(true, "Logout successful");
    }
    
}
