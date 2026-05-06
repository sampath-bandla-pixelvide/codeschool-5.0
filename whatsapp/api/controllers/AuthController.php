<?php
require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../functions.php');

class AuthController
{
    private $db;
    function __construct()
    {
        $this->db = new DB();
    }

    public function checkFieldAvailability($field, $value)
    {
        $allowed = ['username', 'email', 'phone'];
        if (!in_array($field, $allowed)) return false;

        $query = "SELECT id FROM users WHERE $field = :value LIMIT 1";
        $result = $this->db
            ->query($query)
            ->first(['value' => $value]);

        return $result ? true : false;
    }

    public static function validateUsername($username)
    {
        if (empty($username)) return "Username required";
        if (strlen($username) < 3) return "Username too short";
        return null;
    }

    public static function validatePhone($phone)
    {
        if (empty($phone)) return "Phone required";
        if (!preg_match('/^[0-9]{10}$/', $phone)) return "Invalid phone";
        return null;
    }

    public static function validateEmail($email)
    {
        if (empty($email)) return "Email required";

        if (!preg_match('/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/', $email)) {
            return "Invalid email";
        }

        return null;
    }

    public static function validatePassword($password)
    {
        if (empty($password)) return "Password required";
        if (strlen($password) < 6) return "Minimum 6 characters";
        return null;
    }

    public function register($username, $email, $phone, $password)
    {
        // 1. Check if already exists
        $exists = $this->db->query(
            "SELECT id FROM users WHERE username = :u OR email = :e OR phone = :p"
        )->first([
            'u' => $username,
            'e' => $email,
            'p' => $phone
        ]);

        if ($exists) {
            return [
                "status" => false,
                "message" => "Username or Email or Phone already exists"
            ];
        }

        // 2. Hash password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // 3. Insert user
        $this->db->run(
            "INSERT INTO users (username, email, phone, password_hash)
         VALUES (:u, :e, :p, :pw)",
            [
                'u'  => $username,
                'e'  => $email,
                'p'  => $phone,
                'pw' => $hashedPassword
            ]
        );

        return ["status" => true];
    }
    public function loginWithPassword($email, $password){
        $user = $this->db->query(
            "SELECT * FROM users WHERE email = :email LIMIT 1"
        )->first(['email' => $email]);

        if (!$user) {
            sendResponse(false, "User not found");
        }

        if (!password_verify($password, $user['password_hash'])) {
            sendResponse(false, "Invalid password");
        }

        $token = $this->getNewToken($user['id']);

        unset($user['password_hash']);
        $user['token'] = $token;

        sendResponse(true, "Success", $user);
    }
    public function getNewToken($userId){
        $token = bin2hex(random_bytes(32)); // strong token
        $expiryAt = date('Y-m-d H:i:s', strtotime('+2 days'));

        $query = "INSERT INTO sessions (user_id, token_hash, expires_at)
              VALUES (:uid, :token, :expiry)";

        $this->db->run($query, [
            'uid'   => $userId,
            'token' => $token,
            'expiry' => $expiryAt
        ]);

        return $token;
    }
    public function sendOtp($phone)
    {

        $user = $this->db->query(
            "SELECT id FROM users WHERE phone = :p"
        )->first(['p' => $phone]);

        if (!$user) {
            return ["status" => false, "message" => "User not found"];
        }
        $otp = generateOTP();
        $otpHash = password_hash($otp, PASSWORD_BCRYPT);

        // invalidate old OTPs
        // $this->db->run(
        //     "UPDATE otps SET is_used = true WHERE phone = :p AND is_used = false",
        //     ['p' => $phone]
        // );

        // insert new OTP
        $this->db->run(
            "INSERT INTO otps (phone, otp_hash, purpose, expires_at)
         VALUES (:p, :h, 'login', NOW() + INTERVAL '60 seconds')",
            [
                'p' => $phone,
                'h' => $otpHash
            ]
        );

        // return ["status" => true, "message" => "OTP sent"];
        sendResponse(true, "otp sent", ["otp" => $otp]);
    }
    public function verifyOtp($phone, $otp)
    {

        // 1. get latest OTP
        $otpRow = $this->db->query(
            "SELECT * FROM otps
         WHERE phone = :p AND is_used = false
         AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1"
        )->first(['p' => $phone]);

        if (!$otpRow) {
            // sendResponse(false, "No OTP found");
            sendResponse(false, "OTP expired");
        }

        // expiry check
        // can fail because of timezone mismatch or format issues
        // if (strtotime($otpRow['expires_at']) < time()) {
        //     sendResponse(false, "OTP expired");
        // }

        // attempts check
        // if ($otpRow['attempts'] >= 3) {
        //     return ["status" => false, "message" => "Too many attempts"];
        // }

        //  verify OTP
        if (!password_verify($otp, $otpRow['otp_hash'])) {

            // increment attempts
            $this->db->run(
                "UPDATE otps SET attempts = attempts + 1 WHERE id = :id",
                ['id' => $otpRow['id']]
            );

            return sendResponse(false, "Invalid OTP");
        }

        //  mark used
        $this->db->run(
            "UPDATE otps SET is_used = true, is_verified = true WHERE id = :id",
            ['id' => $otpRow['id']]
        );

        // 6. get user
        $user = $this->db->query(
            "SELECT * FROM users WHERE phone = :p"
        )->first(['p' => $phone]);

        $token = $this->getNewToken($user['id']);

        unset($user['password_hash']);
        $user['token'] = $token;

        sendResponse(true, "Success", $user);
    }
    public function updateProfile($userId)
    {
        $name = $_POST['name'] ?? null;

        if (!$name) {
            return ["error" => "Name is required"];
        }

        $profilePath = null;

        if (!empty($_FILES['profile_picture']['name'])) {

            $file = $_FILES['profile_picture'];
            $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!in_array($file['type'], $allowedTypes)) {
                return ["error" => "Invalid image type"];
            }

            // generate unique filename
            $filename = time() . "_" . basename($file['name']);

            $uploadDir = __DIR__ . "/../../uploads/";
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $targetPath = $uploadDir . $filename;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $profilePath = "/uploads/" . $filename;
            } else {
                return ["error" => "Image upload failed"];
            }
        }


        $this->db->run("
        UPDATE users
        SET 
            username = :name,
            profile_picture = COALESCE(:pic, profile_picture)
        WHERE id = :id
        ", [
            'name' => $name,
            'pic'  => $profilePath,
            'id'   => $userId
        ]);

        return [
            "message" => "Profile updated successfully",
            "profile_picture" => $profilePath
        ];
    }

    public function changePassword($userId, $newPassword)
    {



        if (!$newPassword) {
            return ["error" => "New password is required"];
        }

        if (strlen($newPassword) < 6) {
            return ["error" => "Password must be at least 6 characters"];
        }


        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

        $this->db->run("
        UPDATE users
        SET password_hash = :pass
        WHERE id = :id
    ", [
            'pass' => $hashedPassword,
            'id'   => $userId
        ]);

        return ["message" => "Password updated successfully"];
    }
    public function logout($userId)
    {
        // 1. deactivate ONLY this session
        $this->db->run("
        UPDATE sessions
        SET 
            status = false
           
        WHERE user_id = :id
    ", [
            'id' => $userId
        ]);


        $this->db->run("
                UPDATE users
                SET 
                    is_online = false,
                    last_seen = NOW()
                WHERE id = :id
            ", ['id' => $userId]);



        return ["message" => "Logged out successfully"];
    }
}
