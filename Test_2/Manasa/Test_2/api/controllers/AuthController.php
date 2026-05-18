<?php

require_once __DIR__ . '/../database/db.php';
require_once __DIR__ . '/../php_formValidations/registerValidation.php';
require_once __DIR__ . '/../php_formValidations/loginValidation.php';

class AuthController
{
    private $db;

    public function __construct()
    {
        $this->db = new DB();
    }

    public function register($data)
    {
        $validator = new RegisterValidation();
        $errors = $validator->validate($data);

        if (!empty($errors)) {
            return [
                "status" => "error",
                "errors" => $errors
            ];
        }

        $name = trim($data['name']);
        $email = trim($data['email']);
        $phone = trim($data['phone']);
        $password = $data['password'];

        $this->db->query("SELECT id FROM users WHERE email = :email OR phone = :phone");

        $user = $this->db->first([
            ":email" => $email,
            ":phone" => $phone
        ]);

        if ($user) {
            return [
                "status" => "error",
                "message" => "User already exists"
            ];
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $this->db->query("
            INSERT INTO users (name, email, phone, password, role)
            VALUES (:name, :email, :phone, :password, :role)
        ");

        $this->db->create([
            ":name" => $name,
            ":email" => $email,
            ":phone" => $phone,
            ":password" => $hashedPassword,
            ":role" => "user"
        ]);

        return [
            "status" => "success",
            "message" => "User registered successfully"
        ];
    }

    public function login($data)
    {

        $validator = new LoginValidation();
        $errors = $validator->validate($data);

        if (!empty($errors)) {
            return [
                "status" => "error",
                "errors" => $errors
            ];
        }

        $email = trim($data['email']);
        $password = $data['password'];

        $this->db->query("SELECT * FROM users WHERE email = :email");
        $user = $this->db->first([
            ":email" => $email
        ]);

        if (!$user) {
            return [
                "status" => "error",
                "message" => "User not found"
            ];
        }

        if (!password_verify($password, $user['password'])) {
            return [
                "status" => "error",
                "message" => "Invalid password"
            ];
        }

        $token = bin2hex(random_bytes(32));

        $this->db->query("
        INSERT INTO tokens (user_id, token, type, expires_at)
        VALUES (:user_id, :token, 'login', NOW() + INTERVAL '1 day')
    ");

        $this->db->create([
            ":user_id" => $user['id'],
            ":token" => $token
        ]);

        return [
            "status" => "success",
            "token" => $token,
            "user" => $user
        ];
    }

    public function getUserByToken($token)
    {

        $this->db->query("
SELECT user_id FROM tokens 
WHERE token = :token 
AND is_valid = true
AND expires_at > NOW()
AND type = 'login'
");

        $tokenData = $this->db->first([
            ":token" => $token
        ]);

        if (!$tokenData) {
            return [
                "status" => "error",
                "message" => "Invalid or expired token"
            ];
        }


        $this->db->query("
        SELECT id, name, email, role 
        FROM users 
        WHERE id = :id
    ");

        $user = $this->db->first([
            ":id" => $tokenData['user_id']
        ]);

        return [
            "status" => "success",
            "user" => $user
        ];
    }
    public function sendOtp($data)
    {
        $email = trim($data['email']);


        $this->db->query("SELECT id FROM users WHERE email = :email");
        $user = $this->db->first([
            ":email" => $email
        ]);

        if (!$user) {
            return [
                "status" => "error",
                "message" => "Email not found"
            ];
        }


        $otp = rand(100000, 999999);


        $this->db->query("
        INSERT INTO tokens (user_id, otp, type, expires_at)
        VALUES (:user_id, :otp, 'otp', NOW() + INTERVAL '10 minutes')
    ");

        $this->db->create([
            ":user_id" => $user['id'],
            ":otp" => $otp
        ]);


        error_log("OTP for $email is: $otp");

        return [
            "status" => "success",
            "otp" => $otp,
            "message" => "OTP sent successfully"
        ];
    }
    public function verifyOtp($data)
    {
        $email = trim($data['email']);
        $otp = trim($data['otp']);


        $this->db->query("SELECT id FROM users WHERE email = :email");
        $user = $this->db->first([":email" => $email]);

        if (!$user) {
            return [
                "status" => "error",
                "message" => "User not found"
            ];
        }


        $this->db->query("
    SELECT * FROM tokens
    WHERE user_id = :user_id
    AND otp = :otp
    AND type = 'otp'
    AND is_used = false
    AND expires_at > NOW()
    ORDER BY id DESC
    LIMIT 1
");

        $tokenData = $this->db->first([
            ":user_id" => $user['id'],
            ":otp" => $otp
        ]);

        if (!$tokenData) {
            return [
                "status" => "error",
                "message" => "Invalid or expired OTP"
            ];
        }


        $this->db->query("UPDATE tokens SET is_used = true WHERE id = :id");
        $this->db->update([
            ":id" => $tokenData['id']
        ]);


        $token = bin2hex(random_bytes(32));

        $this->db->query("
    INSERT INTO tokens (user_id, token, type, expires_at)
    VALUES (:user_id, :token, 'login', NOW() + INTERVAL '1 day')
");

        $this->db->create([
            ":user_id" => $user['id'],
            ":token" => $token
        ]);

        return [
            "status" => "success",
            "token" => $token
        ];
    }


    public function resendOtp($email)
    {

        $this->db->query("SELECT id FROM users WHERE email = :email");
        $user = $this->db->first([":email" => $email]);

        if (!$user) {
            return [
                "status" => "error",
                "message" => "User not found"
            ];
        }

        $otp = rand(100000, 999999);

        $this->db->query("
        INSERT INTO tokens (user_id, otp, type, expires_at)
        VALUES (:user_id, :otp, 'otp', NOW() + INTERVAL '10 minutes')
    ");

        $this->db->create([
            ":user_id" => $user['id'],
            ":otp" => $otp
        ]);

        return [
            "status" => "success",
            "otp" => $otp,
            "message" => "OTP resent successfully"
        ];
    }

    public function updateProfile($data)
    {
        $id = $data['id'];
        $name = trim($data['name']);
        $phone = trim($data['phone']);

        $this->db->query("
        UPDATE users
        SET name = :name,
            phone = :phone
        WHERE id = :id
    ");

        $this->db->update([
            ":name" => $name,
            ":phone" => $phone,
            ":id" => $id
        ]);

        if (!empty($data['newPassword'])) {

            $currentPassword = $data['currentPassword'];
            $newPassword = $data['newPassword'];

            $this->db->query("SELECT password FROM users WHERE id = :id");
            $user = $this->db->first([
                ":id" => $id
            ]);

            if (!password_verify($currentPassword, $user['password'])) {
                return [
                    "status" => "error",
                    "message" => "Current password is wrong"
                ];
            }

            $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

            $this->db->query("
            UPDATE users
            SET password = :password
            WHERE id = :id
        ");

            $this->db->update([
                ":password" => $hashedPassword,
                ":id" => $id
            ]);
        }

        return [
            "status" => "success",
            "message" => "Profile updated successfully"
        ];
    }

    public function addItem($data)
    {

        $role = $data['role'] ?? 'user';


        $status = ($role === 'admin') ? 'approved' : 'pending';


        $this->db->query("
        INSERT INTO items 
        (user_id, item_type, title, description, category, location, contact, status)
        VALUES 
        (:user_id, :item_type, :title, :description, :category, :location, :contact, :status)
    ");

        $this->db->create([
            ":user_id" => $data['user_id'],
            ":item_type" => $data['type'],
            ":title" => $data['title'],
            ":description" => $data['description'],
            ":category" => $data['category'],
            ":location" => $data['location'],
            ":contact" => $data['contact'],
            ":status" => $status
        ]);

        $itemId = $this->db->lastInsertId();


        if (!empty($data['images'])) {
            foreach ($data['images'] as $img) {
                $this->db->query("
                INSERT INTO item_images (item_id, image_path)
                VALUES (:item_id, :image)
            ");

                $this->db->create([
                    ":item_id" => $itemId,
                    ":image" => $img
                ]);
            }
        }

        return [
            "status" => "success",
            "message" => "Item added successfully"
        ];
    }

    public function getItems($role)
    {
        if ($role === 'admin') {
            $this->db->query("SELECT * FROM items ORDER BY id DESC");
        } else {
            $this->db->query("SELECT * FROM items WHERE status = 'approved' ORDER BY id DESC");
        }

        $items = $this->db->get();

        foreach ($items as &$item) {
            $this->db->query("SELECT image_path FROM item_images WHERE item_id = :id");
            $item['images'] = $this->db->get([":id" => $item['id']]);
        }

        return [
            "status" => "success",
            "items" => $items
        ];
    }

    public function updateItemStatus($data)
    {
        $id = $data['id'];
        $status = $data['status'];

        $this->db->query("
        UPDATE items
        SET status = :status
        WHERE id = :id
    ");

        $this->db->update([
            ":status" => $status,
            ":id" => $id
        ]);

        return [
            "status" => "success",
            "message" => "Status updated"
        ];
    }

    public function deleteItem($id)
    {

        $this->db->query("
        DELETE FROM item_images
        WHERE item_id = :id
    ");

        $this->db->delete([
            ":id" => $id
        ]);


        $this->db->query("
        DELETE FROM items
        WHERE id = :id
    ");

        $this->db->delete([
            ":id" => $id
        ]);

        return [
            "status" => "success",
            "message" => "Item deleted successfully"
        ];
    }
}
