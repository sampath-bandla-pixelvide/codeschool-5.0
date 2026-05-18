<?php
require_once(__DIR__ . "/../utils/db.php");
require_once(__DIR__ . "/../utils/functions.php");

class AuthController
{
    private $db;

    public function __construct()
    {
        $this->db = new DB();
    }

    public static function authenticate()
    {
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
        $db->query(
            "SELECT u.* FROM users u
             JOIN user_tokens ut ON u.id = ut.user_id
             WHERE ut.token = :token
               AND ut.is_valid = TRUE
               AND ut.expires_at > NOW()"
        );
        $user = $db->first([':token' => $token]);

        if (!$user) {
            http_response_code(401);
            sendResponse(false, "Unauthorized: Invalid or expired token");
            exit;
        }

        unset($user['password']);
        return $user;
    }

    private function generateOtp()
    {
        return strval(random_int(100000, 999999));
    }

    private function storeOtp($email, $mobile, $otp, $purpose)
    {
        $this->db->query(
            "INSERT INTO otp_codes (email, mobile, otp, purpose, expires_at)
             VALUES (:email, :mobile, :otp, :purpose, NOW() + INTERVAL '10 minutes')"
        );
        $this->db->create([
            'email'   => $email,
            'mobile'  => $mobile,
            'otp'     => $otp,
            'purpose' => $purpose
        ]);
    }

    private function verifyOtp($value, $field, $purpose)
    {
        $otp = $_POST['otp_' . $field] ?? '';
        if (empty($otp)) return false;

        $this->db->query(
            "SELECT id FROM otp_codes
             WHERE $field = :val
               AND otp = :otp
               AND purpose = :purpose
               AND is_used = FALSE
               AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1"
        );
        $row = $this->db->first([':val' => $value, ':otp' => $otp, ':purpose' => $purpose]);

        if (!$row) return false;

        $this->db->query("UPDATE otp_codes SET is_used = TRUE WHERE id = :id");
        $this->db->update([':id' => $row['id']]);
        return true;
    }

    public function sendRegistrationOtp()
    {
        $name     = trim($_POST['name']     ?? '');
        $email    = trim($_POST['email']    ?? '');
        $mobile   = trim($_POST['mobile']   ?? '');
        $password = $_POST['password']      ?? '';

        if (empty($name) || empty($email) || empty($mobile) || empty($password)) {
            sendResponse(false, "All fields are required");
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, "Invalid email format");
        }
        if (!preg_match('/^[0-9]{10}$/', $mobile)) {
            sendResponse(false, "Mobile must be 10 digits");
        }
        if (strlen($password) < 6) {
            sendResponse(false, "Password must be at least 6 characters");
        }

        $this->db->query("SELECT id FROM users WHERE email = :email");
        if ($this->db->first([':email' => $email])) {
            sendResponse(false, "Email already registered");
        }

        $this->db->query("SELECT id FROM users WHERE mobile = :mobile");
        if ($this->db->first([':mobile' => $mobile])) {
            sendResponse(false, "Mobile already registered");
        }

        $emailOtp  = $this->generateOtp();
        $mobileOtp = $this->generateOtp();

        $this->storeOtp($email, null, $emailOtp,  'verify_email');
        $this->storeOtp(null, $mobile, $mobileOtp, 'verify_mobile');

        error_log("[DEV] Email OTP for $email: $emailOtp");
        error_log("[DEV] Mobile OTP for $mobile: $mobileOtp");

        sendResponse(true, "OTPs sent successfully", [
            'dev_email_otp'  => $emailOtp,
            'dev_mobile_otp' => $mobileOtp
        ]);
    }

    public function verifyAndRegister()
    {
        $name      = trim($_POST['name']      ?? '');
        $email     = trim($_POST['email']     ?? '');
        $mobile    = trim($_POST['mobile']    ?? '');
        $password  = $_POST['password']       ?? '';
        $emailOtp  = trim($_POST['email_otp'] ?? '');
        $mobileOtp = trim($_POST['mobile_otp'] ?? '');

        if (empty($name) || empty($email) || empty($mobile) || empty($password) || empty($emailOtp) || empty($mobileOtp)) {
            sendResponse(false, "All fields including OTPs are required");
        }

        $this->db->query(
            "SELECT id FROM otp_codes
             WHERE email = :email AND otp = :otp AND purpose = 'verify_email'
               AND is_used = FALSE AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1"
        );
        $emailRow = $this->db->first([':email' => $email, ':otp' => $emailOtp]);
        if (!$emailRow) {
            sendResponse(false, "Invalid or expired Email OTP");
        }

        $this->db->query(
            "SELECT id FROM otp_codes
             WHERE mobile = :mobile AND otp = :otp AND purpose = 'verify_mobile'
               AND is_used = FALSE AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1"
        );
        $mobileRow = $this->db->first([':mobile' => $mobile, ':otp' => $mobileOtp]);
        if (!$mobileRow) {
            sendResponse(false, "Invalid or expired Mobile OTP");
        }

        $this->db->query("UPDATE otp_codes SET is_used = TRUE WHERE id = :id");
        $this->db->update([':id' => $emailRow['id']]);
        $this->db->update([':id' => $mobileRow['id']]);

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $this->db->query(
            "INSERT INTO users (name, email, mobile, password, role)
             VALUES (:name, :email, :mobile, :password, 'user')"
        );

        if ($this->db->create([
            'name'     => $name,
            'email'    => $email,
            'mobile'   => $mobile,
            'password' => $hashedPassword
        ])) {
            sendResponse(true, "Account created successfully! Please login.");
        } else {
            sendResponse(false, "Registration failed. Please try again.");
        }
    }

    public function login()
    {
        $email    = trim($_POST['email']    ?? '');
        $password = $_POST['password']      ?? '';

        if (empty($email) || empty($password)) {
            sendResponse(false, "Email and password are required");
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, "Invalid email format");
        }

        $this->db->query("SELECT * FROM users WHERE email = :email AND is_active = TRUE");
        $user = $this->db->first([':email' => $email]);

        if (!$user || !password_verify($password, $user['password'])) {
            sendResponse(false, "Invalid email or password");
        }

        $token = generateRandomString(64);
        $this->db->query("INSERT INTO user_tokens (user_id, token) VALUES (:user_id, :token)");
        $this->db->create(['user_id' => $user['id'], 'token' => $token]);

        unset($user['password']);
        sendResponse(true, "Login successful", ['token' => $token, 'user' => $user]);
    }

    public function logout()
    {
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? $_POST['token'] ?? '';
        if (empty($token)) {
            sendResponse(false, "Token is required");
        }
        $this->db->query("UPDATE user_tokens SET is_valid = FALSE WHERE token = :token");
        $this->db->update([':token' => $token]);
        sendResponse(true, "Logged out successfully");
    }

    public function getCurrentUser()
    {
        $user = self::authenticate();
        sendResponse(true, "Authenticated", ['user' => $user]);
    }

    public function forgotPassword()
    {
        $email = trim($_POST['email'] ?? '');

        if (empty($email)) {
            sendResponse(false, "Email is required");
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, "Invalid email format");
        }

        $this->db->query("SELECT id FROM users WHERE email = :email AND is_active = TRUE");
        if (!$this->db->first([':email' => $email])) {
            sendResponse(false, "No account found with this email");
        }

        $otp = $this->generateOtp();
        $this->storeOtp($email, null, $otp, 'reset_password');

        error_log("[DEV] Password Reset OTP for $email: $otp");

        sendResponse(true, "Reset OTP sent to your email", [
            'dev_otp' => $otp
        ]);
    }

    public function resetPassword()
    {
        $email       = trim($_POST['email']        ?? '');
        $otp         = trim($_POST['otp']          ?? '');
        $newPassword = $_POST['new_password']      ?? '';

        if (empty($email) || empty($otp) || empty($newPassword)) {
            sendResponse(false, "All fields are required");
        }
        if (strlen($newPassword) < 6) {
            sendResponse(false, "Password must be at least 6 characters");
        }

        $this->db->query(
            "SELECT id FROM otp_codes
             WHERE email = :email AND otp = :otp AND purpose = 'reset_password'
               AND is_used = FALSE AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1"
        );
        $row = $this->db->first([':email' => $email, ':otp' => $otp]);

        if (!$row) {
            sendResponse(false, "Invalid or expired OTP");
        }

        $this->db->query("UPDATE otp_codes SET is_used = TRUE WHERE id = :id");
        $this->db->update([':id' => $row['id']]);

        $hashed = password_hash($newPassword, PASSWORD_BCRYPT);
        $this->db->query("UPDATE users SET password = :password WHERE email = :email");
        $this->db->update([':password' => $hashed, ':email' => $email]);

        sendResponse(true, "Password reset successfully! Please login.");
    }

    public function sendLoginOtp()
    {
        $email = trim($_POST['email'] ?? '');

        if (empty($email)) {
            sendResponse(false, "Email is required");
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, "Invalid email format");
        }

        $this->db->query("SELECT id FROM users WHERE email = :email AND is_active = TRUE");
        if (!$this->db->first([':email' => $email])) {
            sendResponse(false, "No account found with this email");
        }

        $otp = $this->generateOtp();
        $this->storeOtp($email, null, $otp, 'login');

        error_log("[DEV] Login OTP for $email: $otp");

        sendResponse(true, "OTP sent to your email", [
            'dev_otp' => $otp
        ]);
    }

    public function loginWithOtp()
    {
        $email = trim($_POST['email'] ?? '');
        $otp   = trim($_POST['otp']   ?? '');

        if (empty($email) || empty($otp)) {
            sendResponse(false, "Email and OTP are required");
        }

        $this->db->query(
            "SELECT id FROM otp_codes
             WHERE email = :email AND otp = :otp AND purpose = 'login'
               AND is_used = FALSE AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1"
        );
        $row = $this->db->first([':email' => $email, ':otp' => $otp]);

        if (!$row) {
            sendResponse(false, "Invalid or expired OTP");
        }

        $this->db->query("UPDATE otp_codes SET is_used = TRUE WHERE id = :id");
        $this->db->update([':id' => $row['id']]);

        $this->db->query("SELECT * FROM users WHERE email = :email AND is_active = TRUE");
        $user = $this->db->first([':email' => $email]);

        if (!$user) {
            sendResponse(false, "Account not found");
        }

        $token = generateRandomString(64);
        $this->db->query("INSERT INTO user_tokens (user_id, token) VALUES (:user_id, :token)");
        $this->db->create(['user_id' => $user['id'], 'token' => $token]);

        unset($user['password']);
        sendResponse(true, "Login successful", ['token' => $token, 'user' => $user]);
    }
}
