<?php

require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../config/helperFunction.php";

class AuthController
{
    public $db = null;

    function __construct()
    {
        $this->db = new DB();
    }
 
    public static function validateEmail($email)
    {
        $emailRegex = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';
        if (!preg_match($emailRegex, $email)) {
            return sendResponse(false, "Email is invalid");
        }
        return true;
    }

    public static function validatePhone($phone){
        $regex = "/^[6-9]\d{9}$/";
        if (!preg_match($regex, $phone)) {
            return sendResponse(false, "Enter a valid phone no");
        }
        return true;
    }

    public static function validatePassword($password)
    {
        if (strlen($password) < 5) {
            return sendResponse(false, "Password should be at least 5 characters");
        }
 
        if (strlen($password) > 20) {
            return sendResponse(false, "Password should be at most 20 characters");
        }

        if (!preg_match('/[A-Z]/', $password)) {
            return sendResponse(false, "Password must contain at least one uppercase letter");
        }

        if (!preg_match('/[a-z]/', $password)) {
            return sendResponse(false, "Password must contain at least one lowercase letter");
        }

        if (!preg_match('/[0-9]/', $password)) {
            return sendResponse(false, "Password must contain at least one number");
        }

        if (!preg_match('/[@$!%*?&]/', $password)) {
            return sendResponse(false, "Password must contain at least one special character (@$!%*?&)");
        }

        return true;
    }

    public static function validateName($name)
    {
        if (empty($name)) {
            return sendResponse(false, "Name is required");
        }

        if (!preg_match('/^[A-Za-z]{2,30}$/', $name)) {
            return sendResponse(false, "Name must contain only letters (2-30 characters)");
        }

        return true;
    }
 
    public static function validateDob($dob)
    {
        if (empty($dob)) {
            sendResponse(false, "Date of birth is required");
        }

        $date = DateTime::createFromFormat('Y-m-d', $dob);
        if (!$date) {
            sendResponse(false, "Invalid date of birth");
        }
        $today = new DateTime();
        $age = $today->diff($date)->y;

        if ($age < 16) {
            sendResponse(false, "Minimum age should be at least 16 years");
        }

        return true;
    }

    public static function confirmPasswordStatus($password, $confirm_password)
    {
        if (!$password || !$confirm_password) {
            return sendResponse(false, "Password and confirm password must not be empty");
        }
        if ($password !== $confirm_password) {
            return sendResponse(false, "Password and confirm password do not match");
        }
        return true;
    }

    public function isEmailExists($email)
    {
        $checkEmailQuery = "SELECT id FROM users WHERE email = :email";
        $this->db->query($checkEmailQuery);
        $foundEmail = $this->db->first([':email' => $email]);
        return !empty($foundEmail);
    }

    public function logout($token)
    {
        if (empty($token)) {
            return sendResponse(false, "Token missing");
        }

        $query = "UPDATE user_tokens 
              SET is_active = false 
              WHERE token = :token AND is_active = true";

        $this->db->query($query);

        $result = $this->db->update([
            ':token' => $token,
        ]);

        if ($result) {
            return sendResponse(true, "Getting logged out 🚀");
        }
        return sendResponse(false, "Logout failed or session already ended");
    }
 
    public function login($email, $password)
    {
        $userQuery = "SELECT first_name, id, role FROM users WHERE email = :email AND password = :password";
        $hashedPwd = md5($password);
        $this->db->query($userQuery);
        $userDetails = $this->db->first([
            ':email' => $email,
            ':password' => $hashedPwd,
        ]);

        if (!$userDetails) {
            return sendResponse(false, "Invalid email or password");
        }

        $token = $this->getNewToken($userDetails['id']);
        $userDetails['token'] = $token;
        // unset($userDetails['id']);
        return sendResponse(true, "Success", $userDetails);
    }

    public function register($firstName, $lastName, $email, $dob,$phoneno,$password)
    {
        if ($this->isEmailExists($email)) {
            return sendResponse(false, "Email is already registered");
        }

        $hashedPwd = md5($password);

        $insertQuery = "INSERT INTO users 
        (first_name, last_name, email, dob, phone, password) 
        VALUES (:first_name, :last_name, :email, :dob, :phone, :password)";

        $this->db->query($insertQuery);

        $insertStatus = $this->db->create([
            ':first_name' => $firstName,
            ':last_name' => $lastName,
            ':email' => $email,
            ':dob' => $dob,
            ':phone'=> $phoneno,
            ':password' => $hashedPwd,
        ]);

        if (!$insertStatus) {
            return sendResponse(false, "User registration failed");
        }
        return sendResponse(true, "User registered successfully");
    }

    public function getNewToken($userId)
    {
        $token = generateRandomString(10);
        $expiryAt = (new DateTime('+2 days'))->format('Y-m-d H:i:s');
        $insertTokenQuery = "INSERT INTO user_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)";

        $this->db->query($insertTokenQuery);
        $insertStatus = $this->db->create([
            ':user_id' => $userId,
            ':token' => $token,
            ':expires_at' => $expiryAt,
        ]);

        if (!$insertStatus) {
            sendResponse(false, 'Something went wrong while logging in!');
        }
        return $token;
    }

    public function setOtpAndEmail($email, $otp)
    {
        $hashed_otp = md5($otp);
        $query = 'INSERT INTO otps (email_id,otp) VALUES (:email,:otp)';
        $this->db->query($query);
        $this->db->create([
            ":email" => $email,
            ":otp" => $hashed_otp
        ]);
        return sendResponse(true, "Otp send Successfully!!($otp)");
    }

    private function clearExpiredOtps()
    {
        $query = "UPDATE otps SET status=FALSE WHERE expire_at < current_timestamp";
        $this->db->query($query);
        $this->db->update();
        return;
    }

    public function verifyOtp($email, $otp)
    {
        $this->clearExpiredOtps();
        $query = "SELECT * FROM otps WHERE email_id=:email AND otp=:otp AND expire_at>CURRENT_TIMESTAMP AND status=TRUE";
        $this->db->query($query);
        $hashedOtp=md5($otp);
        $is_verified = $this->db->first([
            ":email" => $email,
            ":otp" => $hashedOtp
        ]);
        if (!$is_verified) {
            return sendResponse(false, "Invalid or Expired OTP");
        }
        return sendResponse(true, "Enter the new password");
    }

    public function changePassword($email, $password)
    {   
        $hashed_password = md5($password);
        $query = 'UPDATE users SET password = :password WHERE email = :email ;';
        $this->db->query($query);
        $response=$this->db->update([
            ':email'=>$email,
            ':password'=> $hashed_password
        ]);
        if($response){
            return sendResponse(true, 'changed successfully');
        }
        return sendResponse(false, 'please enter a valid password');
    }

    public function updatePassword($userId, $oldPassword, $newPassword) {
        $query = "SELECT password FROM users WHERE id = :id";
        $this->db->query($query);
        $user = $this->db->first([':id' => $userId]);
        
        if (!$user || $user['password'] !== md5($oldPassword)) {
            return sendResponse(false, "Incorrect old password");
        }
        
        $updateQuery = "UPDATE users SET password = :password WHERE id = :id";
        $this->db->query($updateQuery);
        $status = $this->db->update([
            ':password' => md5($newPassword),
            ':id' => $userId
        ]);
        
        if ($status) {
            return sendResponse(true, "Password updated successfully");
        }
        return sendResponse(false, "Failed to update password");
    }
}
