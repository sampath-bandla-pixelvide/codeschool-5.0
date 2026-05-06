<?php

require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";

class AuthController
{
    private $db = null;

    function __construct()
    {
        $this->db = new DB();
    }
    public static function validateEmail($email)
    {
        $emailRegex = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';
        if (!preg_match($emailRegex, $email)) {
            sendResponse(false, "Email is invalid");
        }
        return true;
    }

    public static function validatePassword($password)
    {
        if (strlen($password) < 3) {
            sendResponse(false, "Password should be at least 3 characters");
        }
        if (strlen($password) > 25) {
            sendResponse(false, "Password should be at most 25 characters");
        }
        return true;
    }

    public function isEmailExists($email)
    {
        $checkEmailQuery = "SELECT * FROM users WHERE email = :email";
        $this->db->query($checkEmailQuery);
        $foundEmail = $this->db->first([':email', $email]);
        return !empty($foundEmail);
    }

    public function register($first_name, $last_name, $email, $phone, $password){
        $hashedPwd = md5($password);

        $insertQuery = "INSERT INTO users
        (first_name, last_name, email, phone, password) 
        VALUES (:first_name, :last_name, :email, :phone, :password)";


        $this->db->query($insertQuery);
        $result = $this->db->create([
            'first_name' => $first_name, 
            'last_name' => $last_name,
            'email' => $email,
            'phone' => $phone,
            'password' => $hashedPwd
        ]);

        if(!$result) {
            sendResponse(false, "Something went wrong during User creation!");
        }
        
        sendResponse(true, "User registered successfully!");
    }


    public function login($email, $password)
    {
        $userQuery = "SELECT * FROM users WHERE email = :email AND password = :password";
        $hashedPwd = md5($password);

       
        $this->db->query($userQuery);
        $userDetails = $this->db->first([
            'email' => $email,
            'password' => $hashedPwd
        ]);

        if (empty($userDetails)) {
            sendResponse(false, "Email & Password invalid");
        }

        $token = $this->getNewToken($userDetails['id']);

        $userDetails['token'] = $token;
        sendResponse(true, "Success", $userDetails);
    }

    public function getNewToken($userId)
    {
        $token = generateRandomString(10);
        $expiryAt = date('Y-m-d H:i:s', strtotime('+60 minutes'));

        $insertTokenQuery = "INSERT INTO user_tokens
            (token, user_id, expiry_timestamp)
            VALUES (:token, :user_id, :expiry)";

        $this->db->query($insertTokenQuery);
        $insertStatus = $this->db->create([
            'token' => $token,
            'user_id' => $userId,
            'expiry' => $expiryAt
        ]);

        if (!$insertStatus) {
            sendResponse(false, 'Something went wrong while logging in!');
        }
        return $token;
    }

   
}
