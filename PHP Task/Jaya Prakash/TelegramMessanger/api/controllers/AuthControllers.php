<?php
require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";
session_start();
class AuthControllers
{

    private $db = null;
    function __construct()
    {
        $this->db = new DB();
    }

    public function setOptAndPhone($phone, $rememberMe)
    {
        $otp = rand(100000, 999999);
        $_SESSION["phone"] = $phone;
        $_SESSION["rememberMe"] = $rememberMe;
        $this->db->query("UPDATE otps SET status=FALSE WHERE phone_number=:phone OR otp_expires_at<current_timestamp")->execute([":phone" => $phone]);
        $this->db->query("INSERT INTO otps (phone_number,otp) VALUES (:phone,:otp)")->execute([":phone" => $phone, ":otp" => $otp]);
        return sendResponse(true, "Otp send Successfully!!($otp)");
    }

    private function clearExpiredOtps()
    {
        $this->db->query("UPDATE otps SET status=FALSE WHERE otp_expires_at < current_timestamp");
        return;
    }

    public function verifyOtp($phone, $otp)
    {
        $this->clearExpiredOtps();
        $is_verified = $this->db->query("SELECT 1 FROM otps WHERE phone_number=:phone AND otp=:otp AND otp_expires_at>CURRENT_TIMESTAMP AND status=TRUE")->get([":phone" => $phone, ":otp" => $otp]);
        if (!$is_verified) {
            return sendResponse(false, "Invalid or Expired OTP");
        }
        $userExist = $this->db->query("SELECT 1 as user_exist FROM users WHERE phone_number=:phone")->get([":phone" => $phone]);
        $data['userExist'] = $userExist;
        return sendResponse(true, "OTP verified successfully!!", $data);
    }

    public function isUserNameTaken($userName)
    {
        $userExist = $this->db->query("SELECT 1 FROM users WHERE username=:username")->get([":username" => $userName]);
        if ($userExist) {
            return sendResponse(false, "username already taken!!");
        }
        return sendResponse(true, "username not taken!!");
    }

    public function login($phone, $rememberMe)
    {
        $userDtls = $this->db->query("SELECT id FROM users WHERE phone_number=:phone")->get([":phone" => $phone]);
        $userId = $userDtls['id'];
        $token = generateToken(20);
        $data['token'] = $token;
        $this->db->query("UPDATE user_tokens SET status=FALSE WHERE user_id=:id")->execute([":id" => $userId]);
        if ($rememberMe) {
            $this->db->query("INSERT INTO user_tokens (user_id,token,expires_at) VALUES (:userId,:token,CURRENT_TIMESTAMP + INTERVAL '15 days')")->execute([":userId" => $userId, ":token" => $token]);
        } else {
            $this->db->query("INSERT INTO user_tokens (user_id,token) VALUES (:userId,:token)")->execute([":userId" => $userId, ":token" => $token]);
        }
        $this->db->query("UPDATE users SET is_online=true WHERE phone_number=:phone")->execute([":phone" => $phone]);
        session_destroy();
        return sendResponse(true, "login successful!!", $data);
    }


    public function register($first_name, $last_name, $user_name, $bio, $phone, $photo, $email, $rememberMe)
    {
        $this->db->query("INSERT INTO users (first_name,last_name,username,bio,phone_number,photo,email) VALUES (:first_name,:last_name,:user_name,:bio,:phone,:photo,:email)")->execute([":first_name" => $first_name, ":last_name" => $last_name, ":user_name" => $user_name, ":bio" => $bio, ":phone" => $phone, ":photo" => $photo, ":email" => $email]);
        return $this->login($phone, $rememberMe);
    }

    public function validateToken($token)
    {
        $userId = $this->db->query("SELECT user_id FROM user_tokens WHERE token=:token AND expires_at>CURRENT_TIMESTAMP AND status=TRUE")->get([":token" => $token]);
        if ($userId) {
            $userData = $this->db->query("SELECT username,photo FROM users WHERE id=:id")->get([":id" => $userId['user_id']]);
            return sendResponse(true, "token validated", $userData);
        }
        return sendResponse(false, "invalid token. logging out!!");
    }

    public function logout($token)
    {
        $userData = $this->db->query("SELECT user_id FROM user_tokens WHERE token=:token AND status=TRUE")->get([":token" => $token]);
        $id = $userData['user_id'];
        $this->db->query("UPDATE users SET is_online=FALSE WHERE id=:id")->execute([":id" => $id]);
        $this->db->query("UPDATE user_tokens SET status=FALSE WHERE token=:token AND status=TRUE")->execute([":token" => $token]);
        return sendResponse(true, "logged out successfully");
    }

    public function getUserData($token)
    {
        $userData = $this->db->query("SELECT photo,first_name,last_name,username,email,bio FROM user_tokens ut INNER JOIN users u ON ut.user_id=u.id WHERE token=:token AND status=TRUE")->get([":token" => $token]);
        return sendResponse(true, "user data fetched!!", $userData);
    }

    public function updateProfileData($token, $first_name, $last_name, $user_name, $bio, $email)
    {
        $userData = $this->db->query("SELECT user_id FROM user_tokens WHERE token=:token AND status=TRUE")->get([":token" => $token]);
        $id = $userData['user_id'];
        if (!$id) {
            return sendResponse(false, "invalid token");
        }
        $this->db->query("UPDATE users SET first_name=:first_name,last_name=:last_name,username=:username,bio=:bio,email=:email WHERE id=:id")->execute([":first_name" => $first_name, ":last_name" => $last_name, ":username" => $user_name, ":bio" => $bio, ":email" => $email, ":id" => $id]);
        return sendResponse(true, "user profile updated!!");
    }

    public function updateProfile($token, $first_name, $last_name, $user_name, $bio, $photo, $email)
    {
        $userData = $this->db->query("SELECT user_id FROM user_tokens WHERE token=:token AND status=TRUE")->get([":token" => $token]);
        $id = $userData['user_id'];
        if (!$id) {
            return sendResponse(false, "invalid token");
        }
        $previousImg = $this->db->query("SELECT photo FROM users WHERE id=:id")->get([":id"=>$id]);
        $previousImgPath = "../uploads/" . $previousImg['photo'];
        if (file_exists($previousImgPath)){
            unlink($previousImgPath);
        }
        $this->db->query("UPDATE users SET first_name=:first_name,last_name=:last_name,username=:username,bio=:bio,photo=:photo,email=:email WHERE id=:id")->execute([":first_name" => $first_name, ":last_name" => $last_name, ":username" => $user_name, ":bio" => $bio, ":photo" => $photo, ":email" => $email, ":id" => $id]);
        return sendResponse(true, "user profile updated!!");
    }
}
