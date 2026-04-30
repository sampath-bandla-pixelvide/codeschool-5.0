<?php
require_once __DIR__ . '/../utils/db.php';
class AuthController

{
    private $db;


    public function __construct()
    {
        $this->db = new DB();
    }

    public function signup($data)
    {
        $contact = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');
        $username = trim($data['username'] ?? '');
        $fullname = trim($data['fullname'] ?? '');
        $month = $data['month'] ?? '';
        $day = $data['day'] ?? '';
        $year = $data['year'] ?? '';

        $email = null;
        $phone = null;

        if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
            $email = $contact;
        } elseif (preg_match('/^[6-9]\d{9}$/', $contact)) {
            $phone = $contact;
        } else {
            return ["status" => "error", "message" => "Invalid email or phone"];
        }

        if (strlen($password) < 6) {
            return ["status" => "error", "message" => "Password too short"];
        }

        if (!preg_match('/^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]{3,30}$/', $username)) {
            return ["status" => "error", "message" => "Invalid username"];
        }

        if (!$month || !$day || !$year) {
            return ["status" => "error", "message" => "Select DOB"];
        }

        $dob = "$year-$month-$day";

        $this->db->query("SELECT * FROM users WHERE email = :email OR phone = :phone OR username = :username");

        $user = $this->db->first([
            ":email" => $email,
            ":phone" => $phone,
            ":username" => $username
        ]);

        if ($user) {
            return ["status" => "error", "message" => "User already exists"];
        }


        $otp = rand(100000, 999999);

        $expiresAt = date("Y-m-d H:i:s", strtotime("+5 minutes"));

        $this->db->query("DELETE FROM otp_verifications WHERE contact = :contact");
        $this->db->delete([
            ":contact" => $email ?? $phone
        ]);


        $this->db->query("INSERT INTO otp_verifications (contact, otp, expires_at)
                  VALUES (:contact, :otp, :expires_at)");

        $this->db->create([
            ":contact" => $email ?? $phone,
            ":otp" => $otp,
            ":expires_at" => $expiresAt
        ]);

        $this->db->query("DELETE FROM temp_users WHERE contact = :contact");
        $this->db->delete([
            ":contact" => $email ?? $phone
        ]);


        $this->db->query("INSERT INTO temp_users 
(contact, email, phone, username, password, fullname, dob)
VALUES (:contact, :email, :phone, :username, :password, :fullname, :dob)");

        $this->db->create([
            ":contact" => $email ?? $phone,
            ":email" => $email,
            ":phone" => $phone,
            ":username" => $username,
            ":password" => password_hash($password, PASSWORD_BCRYPT),
            ":fullname" => $fullname,
            ":dob" => $dob
        ]);




        return [
            "status" => "success",
            "otp" => $otp
        ];
    }

    public function verifyOtp($data)
    {
        $enteredOtp = $data['otp'] ?? '';
        $contact = $data['contact'] ?? '';


        $this->db->query("SELECT * FROM otp_verifications 
                      WHERE contact = :contact AND otp = :otp");

        $otpData = $this->db->first([
            ":contact" => $contact,
            ":otp" => $enteredOtp
        ]);

        if (!$otpData) {
            return ["status" => "error", "message" => "Invalid code"];
        }


        if (strtotime($otpData['expires_at']) < time()) {
            return ["status" => "error", "message" => "OTP expired"];
        }

        $this->db->query("SELECT * FROM temp_users WHERE contact = :contact");

        $user = $this->db->first([
            ":contact" => $contact
        ]);

        if (!$user) {
            return ["status" => "error", "message" => "User data missing"];
        }


        $this->db->query("INSERT INTO users (email, phone, username, password, fullname, dob)
                      VALUES (:email, :phone, :username, :password, :fullname, :dob)");

        $result = $this->db->create([
            ":email" => $user['email'],
            ":phone" => $user['phone'],
            ":username" => $user['username'],
            ":password" => $user['password'],
            ":fullname" => $user['fullname'],
            ":dob" => $user['dob']
        ]);


        $this->db->query("DELETE FROM otp_verifications WHERE contact = :contact");
        $this->db->delete([":contact" => $contact]);

        $this->db->query("DELETE FROM temp_users WHERE contact = :contact");
        $this->db->delete([":contact" => $contact]);

        if ($result) {
            return ["status" => "success"];
        } else {
            return ["status" => "error", "message" => "Registration failed"];
        }
    }

    public function login($data)
    {
        $login = trim($data['login'] ?? '');
        $password = trim($data['password'] ?? '');

        if (!$login) {
            return ["status" => "error", "field" => "login", "message" => "Enter email, phone or username"];
        }

        if (!$password) {
            return ["status" => "error", "field" => "password", "message" => "Enter password"];
        }

        $email = null;
        $phone = null;
        $username = null;

        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            $email = $login;
        } elseif (preg_match('/^[6-9]\d{9}$/', $login)) {
            $phone = $login;
        } else {
            $username = $login;
        }

        $this->db->query("
        SELECT * FROM users
        WHERE email = :email
        OR phone = :phone
        OR username = :username
        LIMIT 1
    ");

        $user = $this->db->first([
            ":email" => $email,
            ":phone" => $phone,
            ":username" => $username
        ]);

        if (!$user) {
            return ["status" => "error", "field" => "login", "message" => "User not found"];
        }

        if (!password_verify($password, $user['password'])) {
            return ["status" => "error", "field" => "password", "message" => "Incorrect password"];
        }

        $_SESSION['user_id'] = $user['id'];

        return ["status" => "success"];
    }

    public function getUser()
    {
        if (!isset($_SESSION['user_id'])) {
            return [
                "status" => "error",
                "message" => "Not logged in"
            ];
        }

        $this->db->query("
        SELECT username, fullname ,profile_pic
        FROM users 
        WHERE id = :id 
        LIMIT 1
    ");

        $user = $this->db->first([
            ":id" => $_SESSION['user_id']
        ]);

        return [
            "status" => "success",
            "data" => $user
        ];
    }

    public function uploadPost($file)
    {
        if (!isset($_SESSION['user_id'])) {
            return ["status" => "error", "message" => "Not logged in"];
        }

        if (!isset($file['image'])) {
            return ["status" => "error", "message" => "No image"];
        }

        $folder = __DIR__ . "/../uploads/";

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $fileName = time() . "_" . basename($file['image']['name']);
        $path = $folder . $fileName;

        if (!move_uploaded_file($file['image']['tmp_name'], $path)) {
            return ["status" => "error", "message" => "Upload failed"];
        }


        $this->db->query("
        INSERT INTO posts (user_id, image)
        VALUES (:user_id, :image)
    ");

        $this->db->create([
            ":user_id" => $_SESSION['user_id'],
            ":image" => "uploads/" . $fileName
        ]);
        $postId = $this->db->lastInsertId();


        return [
            "status" => "success",
            "image" => "uploads/" . $fileName,
            "post_id" => $postId

        ];
    }


    public function getPosts()
    {
        if (!isset($_SESSION['user_id'])) {
            return ["status" => "error"];
        }

        $this->db->query("
        SELECT * FROM posts
        WHERE user_id = :user_id
        ORDER BY id DESC
    ");

        $posts = $this->db->get([
            ":user_id" => $_SESSION['user_id']
        ]);

        return [
            "status" => "success",
            "posts" => $posts
        ];
    }

    public function getAllPosts()
    {
        $user_id = $_SESSION['user_id'] ?? 0;

        $this->db->query("
        SELECT 
            posts.*,
            users.username,
            users.profile_pic,

            CASE 
                WHEN likes.id IS NULL THEN 0 
                ELSE 1 
            END AS is_liked,

            CASE 
                WHEN saved_posts.id IS NULL THEN 0 
                ELSE 1 
            END AS is_saved

        FROM posts
        JOIN users ON posts.user_id = users.id

        LEFT JOIN likes 
            ON likes.post_id = posts.id 
            AND likes.user_id = :user_id

        LEFT JOIN saved_posts 
            ON saved_posts.post_id = posts.id 
            AND saved_posts.user_id = :user_id

        ORDER BY posts.id DESC
    ");

        $posts = $this->db->get([
            ":user_id" => $user_id
        ]);

        return [
            "status" => "success",
            "posts" => $posts
        ];
    }

    public function logout()
    {

        $_SESSION = [];


        session_destroy();

        return [
            "status" => "success",
            "message" => "Logged out"
        ];
    }


    public function deletePost($postId)
    {
        if (!isset($_SESSION['user_id'])) {
            return ["status" => "error", "message" => "Not logged in"];
        }

        $this->db->query("SELECT * FROM posts WHERE id = :id AND user_id = :user_id");

        $post = $this->db->first([
            ":id" => $postId,
            ":user_id" => $_SESSION['user_id']
        ]);

        if (!$post) {
            return ["status" => "error", "message" => "Unauthorized"];
        }

        $filePath = __DIR__ . "/../" . $post['image'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }


        $this->db->query("DELETE FROM posts WHERE id = :id");
        $this->db->delete([":id" => $postId]);

        return ["status" => "success"];
    }

    public function uploadProfile($file)
    {
        if (!isset($_SESSION['user_id'])) {
            return ["status" => "error", "message" => "Not logged in"];
        }

        if (!isset($file['profile'])) {
            return ["status" => "error", "message" => "No file"];
        }

        $folder = __DIR__ . "/../uploads/profile/";

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $fileName = time() . "_" . basename($file['profile']['name']);
        $path = $folder . $fileName;

        if (!move_uploaded_file($file['profile']['tmp_name'], $path)) {
            return ["status" => "error", "message" => "Upload failed"];
        }

        $this->db->query("UPDATE users SET profile_pic = :pic WHERE id = :id");

        $this->db->update([
            ":pic" => "uploads/profile/" . $fileName,
            ":id" => $_SESSION['user_id']
        ]);

        return [
            "status" => "success",
            "image" => "uploads/profile/" . $fileName
        ];
    }


    public function removeProfile()
    {
        if (!isset($_SESSION['user_id'])) {
            return ["status" => "error", "message" => "Not logged in"];
        }


        $this->db->query("SELECT profile_pic FROM users WHERE id = :id");
        $user = $this->db->first([
            ":id" => $_SESSION['user_id']
        ]);

        if ($user && $user['profile_pic']) {
            $filePath = __DIR__ . "/../" . $user['profile_pic'];

            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }


        $this->db->query("UPDATE users SET profile_pic = NULL WHERE id = :id");
        $this->db->update([
            ":id" => $_SESSION['user_id']
        ]);

        return ["status" => "success"];
    }

    public function getUserProfile($userId)
    {
        $this->db->query("
        SELECT username, fullname, profile_pic 
        FROM users 
        WHERE id = :id
        LIMIT 1
    ");

        $user = $this->db->first([
            ":id" => $userId
        ]);

        return $user;
    }

    public function toggleSave($data)
    {
        if (!isset($_SESSION['user_id'])) {
            return ["status" => "error", "message" => "Unauthorized"];
        }

        $user_id = $_SESSION['user_id'];
        $post_id = $data['post_id'] ?? null;

        if (!$post_id) {
            return ["status" => "error", "message" => "Post ID missing"];
        }


        $this->db->query("SELECT id FROM saved_posts WHERE user_id = :user_id AND post_id = :post_id");

        $existing = $this->db->first([
            ":user_id" => $user_id,
            ":post_id" => $post_id
        ]);

        if ($existing) {


            $this->db->query("DELETE FROM saved_posts WHERE user_id = :user_id AND post_id = :post_id");

            $this->db->delete([
                ":user_id" => $user_id,
                ":post_id" => $post_id
            ]);

            return ["status" => "success", "action" => "unsaved"];
        } else {


            $this->db->query("INSERT INTO saved_posts (user_id, post_id) VALUES (:user_id, :post_id)");

            $this->db->create([
                ":user_id" => $user_id,
                ":post_id" => $post_id
            ]);

            return ["status" => "success", "action" => "saved"];
        }
    }

    public function getSavedPosts()
    {
        if (!isset($_SESSION['user_id'])) {
            return ["status" => "error"];
        }

        $user_id = $_SESSION['user_id'];

        $this->db->query("
        SELECT posts.* 
        FROM saved_posts 
        JOIN posts ON saved_posts.post_id = posts.id
        WHERE saved_posts.user_id = :user_id
        ORDER BY saved_posts.id DESC
    ");

        $posts = $this->db->get([
            ":user_id" => $user_id
        ]);

        return [
            "status" => "success",
            "posts" => $posts
        ];
    }
}
