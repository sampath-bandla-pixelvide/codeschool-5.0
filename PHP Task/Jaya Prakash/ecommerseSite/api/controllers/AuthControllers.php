<?php
require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";

class AuthControllers
{
    private $db = null;
    function __construct()
    {
        $this->db = new DB();
    }

    private function clearExpiredTokens(){
        $this->db->query("UPDATE user_tokens SET status=false WHERE expires_at < CURRENT_TIMESTAMP AND status=true")->execute();
    }

    public function isEmailExist($email)
    {
        $exist = $this->db->query("SELECT 1 FROM users WHERE email=:email")->get([":email" => $email]);
        if ($exist) {
            return sendResponse(true, "user already exist with this email!!");
        }
        return sendResponse(false, "no user found with this email!!");
    }

    public function isPhoneExist($phone)
    {
        $exist = $this->db->query("SELECT 1 FROM users WHERE phone_number=:phone")->get([":phone" => $phone]);
        if ($exist) {
            return sendResponse(true, "user already exist with this phone number!!");
        }
        return sendResponse(false, "no user found with this phone!!");
    }

    public function register($firstName, $lastName, $email, $phone, $password)
    {
        $hashedPassword = md5($password);
        $this->db->query("INSERT INTO users (first_name, last_name, email, phone_number, password) VALUES (:first_name, :last_name, :email, :phone_number, :password)")
            ->execute([":first_name" => $firstName, ":last_name" => $lastName, ":email" => $email, ":phone_number" => $phone, ":password" => $hashedPassword]);
        return sendResponse(true, "user registered successfully");
    }
    public function login($email, $password)
    {
        $hashedPassword = md5($password);
        $query = "SELECT id,role FROM users where email=:email and password=:password";
        $userData = $this->db->query($query)->get([":email" => $email, ":password" => $hashedPassword]);
        if (!$userData) {
            return sendResponse(false, "Invalid Credentials!!");
        }

        $userId = $userData['id'];
        $userTokensQuery = "UPDATE user_tokens SET status=false WHERE user_id=:id";
        $this->db->query($userTokensQuery)->execute([":id" => $userId]);

        $token = generateSecureToken(20);
        $insertQuery = "INSERT INTO user_tokens (user_id,token) VALUES (:user_id,:token)";
        $this->db->query($insertQuery)->execute([":user_id" => $userId, ":token" => $token]);
        $data['token'] = $token;
        $data['role'] = $userData['role'];
        return sendResponse(true, "Login Successful!!",[],$data);
    }

    public function validateToken($token){
        $this->clearExpiredTokens();
        $query = "SELECT concat(first_name,' ',last_name) as full_name,u.role as role FROM users u INNER JOIN user_tokens ut ON u.id=ut.user_id WHERE token=:token AND expires_at>CURRENT_TIMESTAMP AND ut.status=true";
        $userData = $this->db->query($query)->get([":token"=>$token]);
        if(!$userData){
            return sendResponse(false,"Invalid Token!!");
        }
        return sendResponse(true,"token valiadated!!",[],$userData);
    }

    public function logout($token){
        $this->db->query("UPDATE user_tokens SET status=false WHERE token=:token AND status=true")->execute([":token"=>$token]);
        return sendResponse(true,"logged out successfully!!");
    }
}
