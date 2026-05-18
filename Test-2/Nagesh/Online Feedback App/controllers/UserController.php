<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../config/helperFunction.php";

class UserController {
    private $db;
    public function __construct() {
        $this->db = new DB();
    }
    
    public function updateAvatar($userId, $image) {
        if (!$image) {
            sendResponse(false, "No image uploaded");
            return;
        }
        $fileName = time() . "_" . basename($image['name']);
        $tmpName = $image['tmp_name'];
        $path = "../assets/uploads/" . $fileName;
        
        if (move_uploaded_file($tmpName, __DIR__ . "/../" . ltrim($path, "../"))) {
            $query = "UPDATE users SET avatar = :avatar WHERE id = :id";
            $this->db->query($query);
            $status = $this->db->update([
                ':avatar' => $path,
                ':id' => $userId
            ]);
            
            if ($status) {
                sendResponse(true, "Avatar updated successfully", ['avatar' => $path]);
            } else {
                sendResponse(false, "Failed to update avatar in database");
            }
        } else {
            sendResponse(false, "Failed to move uploaded file");
        }
    }
    
    public function getUser($userId) {
        $query = "SELECT first_name, last_name, email, dob, phone, role, avatar FROM users WHERE id = :id";
        $this->db->query($query);
        $user = $this->db->first([':id' => $userId]);
        if ($user) {
            sendResponse(true, "User fetched", $user);
        } else {
            sendResponse(false, "User not found");
        }
    }
}
