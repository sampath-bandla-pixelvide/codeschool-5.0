<?php

require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";

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

    public static function validatePassword($password)
    {
        if (strlen($password) < 6) {
            return sendResponse(false, "Password should be at least 8 characters");
        }

        if (strlen($password) > 25) {
            return sendResponse(false, "Password should be at most 25 characters");
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
            return sendResponse(false, "Password must contain at least one special character");
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
            return sendResponse(false, "Date of birth is required");
        }

        $date = DateTime::createFromFormat('Y-m-d', $dob);
        $today = new DateTime();
        $age = $today->diff($date)->y;

        if ($age < 16) {
            return sendResponse(false, "Minimum age should be atleasts 16 years");
        }

        return true;
    }

    public static function confirmPasswordStatus($password, $confirm_password)
    {
        if (!$password || !$confirm_password) {
            return sendResponse(false, "Confirm password or password should'nt be empty");
        }
        if (!($password === $confirm_password)) {
            return sendResponse(false, "Password and Confirm Password do not match");
        }
        return true; 
    }

    public function isEmailExists($email)
    {
        $checkEmailQuery = "SELECT * FROM users WHERE email = :email";
        $this->db->query($checkEmailQuery);
        $foundEmail = $this->db->first([':email'=>$email]);
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
            ':token' => $token
        ]);

        if ($result) {
            return sendResponse(true, "Logout successful");
        } else {
            return sendResponse(false, "Logout failed or already inactive");
        }
    }

    public function login($email, $password)
    {
        $userQuery = "SELECT first_name,id FROM users WHERE email = :email AND password = :password";
        $hashedPwd = md5($password);
        $this->db->query($userQuery);
        $userDetails = $this->db->first([
            ':email' => $email,
            ':password' => $hashedPwd
        ]);

        if (!$userDetails) {
            return sendResponse(false, "Email & Password invalid");
        }

        $token = $this->getNewToken($userDetails['id']);
        $userDetails['token'] = $token;
        unset($userDetails['id']);
        return sendResponse(true, "Success", $userDetails);
    }

    public function register($firstName, $lastName, $email, $dob, $password)
    {

        $hashedPwd = md5($password);

        $insertQuery = "INSERT INTO users 
        (first_name, last_name, email,dob,password) 
        VALUES (:first_name, :last_name, :email,:dob,:password)";

        $this->db->query($insertQuery);

        $insertStatus = $this->db->create([
            ':first_name' => $firstName,
            ':last_name' => $lastName,
            ':email' => $email,
            ':dob' => $dob,
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
        $insertTokenQuery = "INSERT INTO user_tokens (user_id,token,expires_at) VALUES (:user_id,:token,:expires_at)";

        $this->db->query($insertTokenQuery);
        $insertStatus = $this->db->create([
            'user_id' => $userId,
            'token' => $token,
            'expires_at' => $expiryAt
        ]);

        if (!$insertStatus) {
            return sendResponse(false, 'Something went wrong while logging in!');
        }
        return $token;
    }

    public function getTeluguMovies()
    {
        $query = 'SELECT 
            m.id,
            m.title,
            m.description,
            m.rating,
            m.duration,
            m.thumbnail,
            m.trailer,
            c.category_name,
            l.name,
            STRING_AGG(a.name, \', \') AS actors

        FROM movies m

        JOIN movies_category mc ON m.id = mc.movie_id
        JOIN category c ON mc.category_id = c.id

        JOIN movie_languages ml ON m.id = ml.movie_id
        JOIN languages l ON ml.language_id = l.id

        LEFT JOIN movie_actors ma ON m.id = ma.movie_id
        LEFT JOIN actors a ON ma.actor_id = a.id

        WHERE l.name = \'Telugu\'

        GROUP BY m.id, c.category_name, l.name
        ORDER BY m.id ASC';
        $this->db->query($query);
        $deatils = $this->db->get();
        return sendResponse(true, 'success', $deatils);
    }

    public function fetchCategory($category)
    {
        $query = 'SELECT 
            m.id,
            m.title,
            m.description,
            m.rating,
            m.duration,
            m.thumbnail,
            m.trailer,
            c.category_name,
            l.name,
            STRING_AGG(a.name, \', \') AS actors

        FROM movies m

        JOIN movies_category mc ON m.id = mc.movie_id
        JOIN category c ON mc.category_id = c.id

        JOIN movie_languages ml ON m.id = ml.movie_id
        JOIN languages l ON ml.language_id = l.id

        LEFT JOIN movie_actors ma ON m.id = ma.movie_id
        LEFT JOIN actors a ON ma.actor_id = a.id

        WHERE c.category_name = :category

        GROUP BY m.id, c.category_name, l.name
        ORDER BY m.id ASC';
        $this->db->query($query);
        $userDetails = $this->db->get([
            ':category' => $category,
        ]);
        return sendResponse(true, 'success', $userDetails);
    }

    public function setOptAndEmail($email, $otp)
    {   
        $query='INSERT INTO otps (email_id,otp) VALUES (:email,:otp)';
        $this->db->query($query);
        $this->db->create([
            ":email"=>$email,
            ":otp"=>$otp
        ]);
        return sendResponse(true,"Otp send Successfully!!($otp)");
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
        $is_verified = $this->db->first([
            ":email"=>$email,
            ":otp"=>$otp
        ]);
        if (!$is_verified) {
            return sendResponse(false, "Invalid or Expired OTP");
        }
        $query = "SELECT first_name,id FROM users WHERE email=:email";
        $this->db->query($query);

        $data=$this->db->first([
           ":email"=>$email,
        ]);

        $token = $this->getNewToken($data['id']);
        $data['token'] = $token;
        unset($data['id']);
        return sendResponse(true, "OTP verified successfully!!",$data);
    }
}
