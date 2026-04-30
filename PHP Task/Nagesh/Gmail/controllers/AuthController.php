<?php

require_once(__DIR__ . "/../config/db.php");
require_once(__DIR__ . "/../config/commonfunctions.php");

class AuthController
{
    private $db = null;

    function __construct()
    {
        $this->db = new DB();
    }

    public static function validateEmail($email)
    {
        $emailRegex = "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/";
        if (!preg_match($emailRegex, $email)) {
            getResponse(false, "Invalid Email");
        }
        return true;
    }

    public static function validatePassword($password)
    {
        if (strlen($password) < 6) {
            getResponse(false, "Password must be at least 6 characters");
        }
        if (strlen($password) > 25) {
            getResponse(false, "Password must be below 25 characters");
        }
        return true;
    }

    public function isEmailExists($email)
    {
        $query = "SELECT id FROM users WHERE email = :email";
        $this->db->query($query);
        $result = $this->db->first([":email" => $email]);
        return !empty($result);
    }

    public function register($data)
    {
        $first_name = trim($data['first_name'] ?? '');
        $last_name  = trim($data['last_name'] ?? '');
        $email      = trim($data['email'] ?? '');
        $password   = $data['password'] ?? '';
        $dob        = $data['dob'] ?? '';
        $gender     = $data['gender'] ?? '';

        if (!$first_name || !$last_name || !$email || !$password || !$dob || !$gender) {
            getResponse(false, "All fields are required");
        }

        self::validateEmail($email);
        self::validatePassword($password);

        if ($this->isEmailExists($email)) {
            getResponse(false, "Email already exists");
        }

        $hashedPwd = password_hash($password, PASSWORD_BCRYPT);

        $query = "INSERT INTO users 
            (first_name, last_name, email, password_hash, dob, gender) 
            VALUES (:first_name, :last_name, :email, :password, :dob, :gender)";

        $this->db->query($query);

        $status = $this->db->create([
            ":first_name" => $first_name,
            ":last_name"  => $last_name,
            ":email"      => $email,
            ":password"   => $hashedPwd,
            ":dob"        => $dob,
            ":gender"     => $gender
        ]);

        if (!$status) {
            getResponse(false, "Registration failed");
        }

        getResponse(true, "Account created successfully");
    }

    public function login($email, $password)
    {
        if (!$email || !$password) {
            getResponse(false, "Email and Password required");
        }

        $query = "SELECT * FROM users WHERE email = :email";
        $this->db->query($query);

        $user = $this->db->first([':email' => $email]);

        if (!$user) {
            getResponse(false, "No account found with this email");
        }

        if (!password_verify($password, $user['password_hash'])) {
            getResponse(false, "Wrong password. Please try again.");
        }

        $token = $this->getNewToken($user['id']);

        getResponse(true, "Login successful", [
            "token" => $token,
            "user"  => [
                "id"         => $user['id'],
                "name"       => $user['first_name'] . " " . $user['last_name'],
                "first_name" => $user['first_name'],
                "last_name"  => $user['last_name'],
                "email"      => $user['email']
            ]
        ]);
    }

    public function getNewToken($userId)
    {
        $token    = generateRandomString(60);
        $expiryAt = date('Y-m-d H:i:s', strtotime('+7 days'));

        $insertTokenQuery = "INSERT INTO user_tokens
            (token, user_id, expires_at)
            VALUES (:token, :user_id, :expires_at)";

        $this->db->query($insertTokenQuery);

        $insertStatus = $this->db->create([
            ':token'      => $token,
            ':user_id'    => $userId,
            ':expires_at' => $expiryAt
        ]);

        if (!$insertStatus) {
            getResponse(false, 'Token generation failed');
        }

        return $token;
    }

    public function validateToken($token)
    {
        if (!$token) {
            getResponse(false, "Unauthorized. Please login.");
        }

        $query = "SELECT u.id, u.first_name, u.last_name, u.email
                  FROM users u
                  INNER JOIN user_tokens ut ON u.id = ut.user_id
                  WHERE ut.token = :token
                  AND ut.expires_at > CURRENT_TIMESTAMP
                  AND ut.is_revoked = FALSE";

        $this->db->query($query);

        $user = $this->db->first([":token" => $token]);

        if (!$user) {
            getResponse(false, "Session expired. Please login again.");
        }

        return $user;
    }
  public function generateOtp($email)
    {
       
        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        $this->db->query("
            UPDATE user_otps 
            SET is_used = TRUE 
            WHERE email = :email
        ");
        $this->db->update([
            ":email" => $email
        ]);

       
        $this->db->query("
            INSERT INTO user_otps (email, otp, expires_at)
            VALUES (:email, :otp, NOW() + INTERVAL '5 minutes')
        ");

        $status = $this->db->create([
            ":email" => $email,
            ":otp"   => $otp
        ]);

        if (!$status) {
            getResponse(false, "Failed to generate OTP");
        }

        // DEBUG (remove in production)
        error_log("NEW OTP: " . $otp);

        return [
            "otp" => $otp
        ];
    }

    public function verifyOtp($email, $otp)
    {
        $otp = trim((string)$otp);

        $this->db->query("
            SELECT * FROM user_otps
            WHERE email = :email
            AND otp = :otp
            AND is_used = FALSE
            AND expires_at > NOW()
            ORDER BY id DESC
            LIMIT 1
        ");

        $otpData = $this->db->first([
            ":email" => $email,
            ":otp"   => $otp
        ]);

        if (!$otpData) {
            getResponse(false, "Invalid or expired OTP");
        }

        return true;
    }


    public function resetPassword($email, $otp, $password)
    {
        $otp = trim((string)$otp);

      
        $this->db->query("
            SELECT * FROM user_otps 
            WHERE email = :email 
            AND otp = :otp 
            AND is_used = FALSE 
            AND expires_at > NOW()
            ORDER BY id DESC
            LIMIT 1
        ");

        $otpData = $this->db->first([
            ":email" => $email,
            ":otp"   => $otp
        ]);

        if (!$otpData) {
            getResponse(false, "Invalid or expired OTP");
        }

        $hashedPwd = password_hash($password, PASSWORD_BCRYPT);

        $this->db->query("
            UPDATE users 
            SET password_hash = :password 
            WHERE email = :email
        ");

        $status = $this->db->update([
            ":password" => $hashedPwd,
            ":email"    => $email
        ]);

        if (!$status) {
            getResponse(false, "Failed to reset password");
        }

        // Mark OTP as used
        $this->db->query("
            UPDATE user_otps 
            SET is_used = TRUE 
            WHERE id = :id
        ");

        $this->db->update([
            ":id" => $otpData['id']
        ]);

        getResponse(true, "Password reset successful");
    }

}    
     
     


