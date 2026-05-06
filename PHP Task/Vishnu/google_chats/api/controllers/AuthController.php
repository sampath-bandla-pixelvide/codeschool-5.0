<?php

require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";

class AuthController
{
    private $db=null;

    public function __construct()
    {
        $this->db = new DB();
    }

    public function sendOtp($email)
    {
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, "A valid email is required.");
        }

        $otp = str_pad(random_int(0, 999999), 6, "0", STR_PAD_LEFT);

        $this->db->query("SELECT id FROM otps WHERE email_id = :email AND status = FALSE LIMIT 1");
        $existingOtp = $this->db->first([":email" => $email]);

        if ($existingOtp) {
            $db2 = new DB();
            $db2->query("UPDATE otps SET otp = :otp, created_at = CURRENT_TIMESTAMP, expires_at = CURRENT_TIMESTAMP + INTERVAL '5 minutes' WHERE id = :id");
            $db2->update([":otp" => $otp, ":id" => $existingOtp["id"]]);
        } else {
            $db2 = new DB();
            $db2->query(
                "INSERT INTO otps (email_id, otp, status)
                 VALUES (:email, :otp, FALSE)"
            );
            $db2->create([":email" => $email, ":otp" => $otp]);
        }

        sendResponse(true, "OTP generated successfully.", ["otp" => $otp]);
    }

    public function verifyOtp($email, $otp)
    {
        if (!$email || !$otp) {
            sendResponse(false, "Email and OTP are required.");
        }

        $this->db->query(
            "SELECT id FROM otps
             WHERE email_id = :email
               AND otp      = :otp
               AND status   = FALSE
               AND expires_at > NOW()
             ORDER BY created_at DESC
             LIMIT 1"
        );
        $record = $this->db->first([":email" => $email, ":otp" => $otp]);

        if (!$record) {
            sendResponse(false, "Invalid or expired OTP. Please try again.");
        }

        $db2 = new DB();
        $db2->query("UPDATE otps SET status = TRUE, updated_at = NOW() WHERE id = :id");
        $db2->update([":id" => $record["id"]]);

        $db3 = new DB();
        $db3->query("SELECT id, first_name, last_name, email, profile_picture FROM users WHERE email = :email LIMIT 1");
        $user = $db3->first([":email" => $email]);

        if (!$user) {
            sendResponse(true, "OTP verified. Please complete your profile.", [
                "redirect" => "register",
                "email"    => $email
            ]);
        }

        $token = bin2hex(random_bytes(10));

        $db4 = new DB();
        $db4->query(
            "INSERT INTO users_token (user_id, token)
             VALUES (:user_id, :token)"
        );
        $db4->create([":user_id" => $user["id"], ":token" => $token]);

        sendResponse(true, "Login successful.", [
            "redirect" => "chat",
            "token"    => $token,
            "user"     => $user
        ]);
    }

    public function completeRegister($email, $first_name, $last_name)
    {
        if (!$email || !$first_name || !$last_name) {
            sendResponse(false, "All fields are required.");
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, "Invalid email address.");
        }

        $this->db->query("SELECT id FROM users WHERE email = :email LIMIT 1");
        $exists = $this->db->first([":email" => $email]);

        if ($exists) {
            sendResponse(false, "An account with this email already exists.");
        }

        $db2 = new DB();
        $db2->query(
            "INSERT INTO users (first_name, last_name, email)
             VALUES (:first_name, :last_name, :email)
             RETURNING id, first_name, last_name, email, profile_picture"
        );
        $newUser = $db2->first([
            ":first_name" => $first_name,
            ":last_name"  => $last_name,
            ":email"      => $email,
        ]);

        if (!$newUser) {
            sendResponse(false, "Failed to create account. Please try again.");
        }

        $token = bin2hex(random_bytes(10));

        $db3 = new DB();
        $db3->query(
            "INSERT INTO users_token (user_id, token)
             VALUES (:user_id, :token)"
        );
        $db3->create([":user_id" => $newUser["id"], ":token" => $token]);

        sendResponse(true, "Account created successfully.", [
            "redirect" => "chat",
            "token"    => $token,
            "user"     => $newUser
        ]);
    }

    public function validateToken($token)
    {
        if (!$token) {
            sendResponse(false, "Token is required.");
        }

        $this->db->query(
            "SELECT u.id, u.first_name, u.last_name, u.email, u.profile_picture
             FROM users_token t
             JOIN users u ON u.id = t.user_id
             WHERE t.token = :token
               AND t.expires_at > NOW()
             LIMIT 1"
        );
        $user = $this->db->first([":token" => $token]);

        if (!$user) {
            sendResponse(false, "Invalid or expired token.");
        }

        sendResponse(true, "Token is valid.", ["user" => $user]);
    }

    public function logout($token)
    {
        if (!$token) {
            sendResponse(false, "Token is required.");
        }

        $this->db->query("DELETE FROM users_token WHERE token = :token");
        $this->db->delete([":token" => $token]);

        sendResponse(true, "Logged out successfully.");
    }
    public function updateProfile($token, $first_name, $last_name)
    {
        if (!$token) sendResponse(false, "Token required.");
        if (!$first_name || !$last_name) sendResponse(false, "First and last name are required.");

        $this->db->query(
            "SELECT user_id FROM users_token WHERE token = :token AND expires_at > NOW() LIMIT 1"
        );
        $t = $this->db->first([":token" => $token]);
        if (!$t) sendResponse(false, "Invalid or expired token.");

        $userId = $t["user_id"];

        $db2 = new DB();
        $db2->query("UPDATE users SET first_name = :fn, last_name = :ln WHERE id = :id");
        $db2->update([":fn" => $first_name, ":ln" => $last_name, ":id" => $userId]);

        sendResponse(true, "Profile updated successfully.");
    }

    public function deleteAccount($token)
    {
        if (!$token) sendResponse(false, "Token required.");

        $this->db->query(
            "SELECT user_id FROM users_token WHERE token = :token AND expires_at > NOW() LIMIT 1"
        );
        $t = $this->db->first([":token" => $token]);
        if (!$t) sendResponse(false, "Invalid or expired token.");

        $userId = $t["user_id"];

        $db2 = new DB();
        $db2->query("DELETE FROM messages WHERE message_from = :id OR message_to = :id");
        $db2->delete([":id" => $userId]);

        $db3 = new DB();
        $db3->query("DELETE FROM mentions WHERE mentioned_user_id = :id OR mentioned_by = :id");
        $db3->delete([":id" => $userId]);

        $db4 = new DB();
        $db4->query("DELETE FROM users_token WHERE user_id = :id");
        $db4->delete([":id" => $userId]);

        $db5 = new DB();
        $db5->query("DELETE FROM users WHERE id = :id");
        $db5->delete([":id" => $userId]);

        sendResponse(true, "Account deleted successfully.");
    }

    public function uploadAvatar($token, $file)
    {
        if (!$token) {
            sendResponse(false, "Token is required.");
        }

        $this->db->query(
            "SELECT u.id, u.first_name, u.last_name, u.email
             FROM users_token t
             JOIN users u ON u.id = t.user_id
             WHERE t.token = :token
               AND t.expires_at > NOW()
             LIMIT 1"
        );
        $user = $this->db->first([":token" => $token]);

        if (!$user) {
            sendResponse(false, "Invalid or expired token.");
        }

        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            sendResponse(false, "No file uploaded or upload error.");
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (!in_array($file['type'], $allowedTypes)) {
            sendResponse(false, "Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.");
        }

        $uploadDir = __DIR__ . '/../uploads/avatars/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'avatar_' . $user['id'] . '_' . time() . '.' . $extension;
        $destination = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $destination)) {
            $avatarUrl = './api/uploads/avatars/' . $filename;
            
            $db2 = new DB();
            $db2->query("UPDATE users SET profile_picture = :avatar_url WHERE id = :id");
            $db2->update([":avatar_url" => $avatarUrl, ":id" => $user['id']]);
            
            sendResponse(true, "Avatar updated successfully", ["avatar_url" => $avatarUrl]);
        } else {
            sendResponse(false, "Failed to save uploaded file.");
        }
    }
}
