<?php
require_once(__DIR__ . "/../utils/db.php");
require_once(__DIR__ . "/../utils/functions.php");

class AuthController {
    private $db;

    public function __construct() {
        $this->db = new DB();
    }

    public static function authenticate() {
        $token = '';

        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $token = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_POST['token'])) {
            $token = $_POST['token'];
        } elseif (isset($_GET['token'])) {
            $token = $_GET['token'];
        }

        if (empty($token)) {
            http_response_code(401);
            sendResponse(false, "Unauthorized: No token provided");
            exit;
        }
         $db = new DB();
        $db->query("SELECT u.* FROM users u JOIN users_token ut ON u.user_id = ut.user_id WHERE ut.token = :token");
        $user = $db->first([':token' => $token]);
        if (!$user) {
            http_response_code(401);
            sendResponse(false, "Unauthorized: Invalid token");
            exit;
        }
        unset($user['password']);
        return $user;
    }

    public function login() {
        $email = $_POST["email"] ?? '';
        $password = $_POST["password"] ?? '';

        if (empty($email) || empty($password)) {
            sendResponse(false, "Email and Password are required");
        }

        $this->db->query("SELECT * FROM users WHERE email = :email");
        $user = $this->db->first([':email' => $email]);

        if (!$user || !password_verify($password, $user['password'])) {
            sendResponse(false, "Invalid email or password");
        }

        $token = generateRandomString(32);
        $this->db->query("INSERT INTO users_token (token, user_id) VALUES (:token, :user_id)");
        $this->db->create(['token' => $token, 'user_id' => $user['user_id']]);

        unset($user['password']);

        sendResponse(true, "Login successful", [
            'token' => $token,
            'user' => $user
        ]); 
    }

    public function logout() {
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? $_POST['token'] ?? '';

        if (empty($token)) {
            sendResponse(false, "Token required");
        }

        $this->db->query("DELETE FROM users_token WHERE token = :token");
        $this->db->delete([':token' => $token]);

        sendResponse(true, "Logged out successfully");
    }

    public function getCurrentUser() {
        $user = self::authenticate();
        sendResponse(true, "Authenticated", ['user' => $user]);
    }

    public function updateProfile() {
        $user = self::authenticate();
        $name = $_POST['name'] ?? $user['name'];
        $email = $_POST['email'] ?? $user['email'];
        $password = $_POST['password'] ?? '';

        if (empty($name) || empty($email)) {
            sendResponse(false, "Name and Email are required");
        }

        if ($email !== $user['email']) {
            $this->db->query("SELECT user_id FROM users WHERE email = :email");
            if ($this->db->first([':email' => $email])) {
                sendResponse(false, "Email already exists");
            }
        }

        if (!empty($password)) {
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $this->db->query("UPDATE users SET name = :name, email = :email, password = :password WHERE user_id = :user_id");
            $success = $this->db->update([':name' => $name, ':email' => $email, ':password' => $hashed, ':user_id' => $user['user_id']]);
        } else {
            $this->db->query("UPDATE users SET name = :name, email = :email WHERE user_id = :user_id");
            $success = $this->db->update([':name' => $name, ':email' => $email, ':user_id' => $user['user_id']]);
        }

        if ($success) {
            $user['name'] = $name;
            $user['email'] = $email;
            sendResponse(true, "Profile updated successfully", ['user' => $user]);
        } else {
            sendResponse(false, "Failed to update profile");
        }
    }

    public function register() {
        $user = self::authenticate();
        if ($user['role'] !== 'admin') {
            sendResponse(false, "Unauthorized: Only admin can register new users");
        }

        $name = $_POST["name"] ?? '';
        $email = $_POST["email"] ?? '';
        $password = $_POST["password"] ?? '';
        $role = $_POST["role"] ?? 'student';

        if (empty($name) || empty($email) || empty($password)) {
            sendResponse(false, "All fields are required");
        }

        $this->db->query("SELECT * FROM users WHERE email = :email");
        if ($this->db->first([':email' => $email])) {
            sendResponse(false, "Email already exists");
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $this->db->query("INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)");
        if ($this->db->create(['name' => $name, 'email' => $email, 'password' => $hashedPassword, 'role' => $role])) {
            sendResponse(true, "Registration successful");
        } else {
            sendResponse(false, "Registration failed");
        }
    }
}
