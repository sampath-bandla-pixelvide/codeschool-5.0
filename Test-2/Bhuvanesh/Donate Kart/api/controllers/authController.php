<?php

require __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";

class authController
{
    private $db = NULL;

    function __construct()
    {
        $this->db = new DB();
    }

    function register($data){
        $selectQuery = "SELECT id from users where email = :email";
        $user = $this->db->query($selectQuery)->first([":email" => $data['email']]);
        if ($user) {
            return sendResponse(false, "User already exists! pls try to login or register with another email");
        }
        $hashedPassword = md5($data['password']);
        $createQuery = "INSERT INTO users (first_name,last_name,email,phone_number,password) VALUES (:first_name,:last_name,:email,:phone_number,:password)";
        $insertStatus = $this->db->query($createQuery)->execute([

        ":first_name" => $data['firstName'],
        ":last_name" => $data['lastName'],
        ":email" => $data['email'],
        ":phone_number" => $data['phone'],
        ":password" => $hashedPassword
        ]);

        if (!$insertStatus) {
            return sendResponse(false, "SomeThing Went Wrong");
        }
        return sendResponse(true, "Registration Successful");
    }

    function login($email, $password){
        $hashed_password = md5($password);;
        $selectQuery = "SELECT * from users where email = :email AND password = :password AND status=true";
        $user = $this->db->query($selectQuery)->first([":email" => $email, ":password" => $hashed_password]);
        if (empty($user)) {
            return sendResponse(false, "Invalid Email or Password!!");
        }
        
        $update =$this->db->query("UPDATE user_tokens SET status = false WHERE expires_at <= CURRENT_TIMESTAMP")->execute([]);

        $token = generateRandomString(10);
        $insertQuery = "INSERT INTO user_tokens(token,user_id) VALUES(:token,:user_id)";
        $insertStatus = $this->db->query($insertQuery)->execute([
            ":token" => $token,
            ":user_id" => $user['id'],
        ]);
        if (!$insertStatus) {
            sendResponse(false, "DatabaseError! Try again Later");
        }
        $isAdmin = false;
        if (strtoupper($user['role']) === "ADMIN") {
            $isAdmin = true;
        }
        $data['token'] = $token;
        $data['isAdmin'] = $isAdmin;
        return sendResponse(true, "Login successful!!", $data);
    }

    function checkEmail($email){
         $checkQuery = "SELECT id FROM users WHERE email = :email";
          $user = $this->db->query($checkQuery)->first([":email" => $email]);
           if ($user) {
            $temp_token = generateRandomString(15);
             $insertQuery = "INSERT INTO temp_tokens (token,user_id) VALUES(:token,:user_id)";
            $insertStatus = $this->db->query($insertQuery)->execute([
                ":token" => $temp_token,
                ":user_id" => $user['id']
            ]);
            if(!$insertStatus){
                sendResponse(false,"DatabaseError! Try again Later");
            }
            $otp = rand(100000, 999999);
            $hashed_otp =md5($otp);
            $insert_query = "INSERT INTO otps(otp,user_id) VALUES(:otp,:user_id)";
            $insert_otp = $this->db->query($insert_query)->execute([
                ":otp" => $hashed_otp,
                ":user_id" => $user['id']
            ]);
            $temp = [
                "temp_token" => $temp_token,
                "otp" =>$otp
            ];
             if(!$insert_otp){
                sendResponse(false,"DatabaseError! Try again Later");
            }
             sendResponse(true,'user-found',$temp);

           }
            sendResponse(false,"no email Exist! or pls check the email");
    }

     function clearPreviousEmailsAndOtps($token) {
        $updateQuery = "UPDATE temp_tokens SET status=false WHERE token = :token AND expires_at <= CURRENT_TIMESTAMP";
        $this->db->query("$updateQuery")->execute([":token" => $token]);
        $session = $this->db->query("SELECT user_id FROM temp_tokens WHERE token = :token")->first([":token" => $token]);
        if(!$session){
            return;
        }
        $user = $session['user_id'];
        $this->db->query("UPDATE otps SET status=false WHERE user_id=:user_id AND otp_expires_at <= CURRENT_TIMESTAMP")->execute([":user_id" => $user]);
    }

    function resendOTP($temp_token){
        $this->clearPreviousEmailsAndOtps($temp_token);
        $session = $this->db->query("SELECT user_id FROM temp_tokens WHERE token = :token AND expires_at > CURRENT_TIMESTAMP")
            ->first([
                ":token" => $temp_token
            ]);

        if (!$session) {
            return sendResponse(false, "Session Expired!!");
        }

        $user = $session['user_id'];
        $otp = rand(100000, 999999);

        $this->db->query("UPDATE otps SET status=false WHERE user_id = :user_id")->execute([":user_id" => $user]);
        $this->db->query("INSERT INTO otps (user_id, otp) VALUES (:user_id, :otp)")->execute([":user_id" => $user, ":otp" => md5($otp)]);
        return sendResponse(true, "OTP resent successfully", ["otp" => $otp]);
    }

    function verifyOtp($temp_token,$otp){
        $this->clearPreviousEmailsAndOtps($temp_token);
          $selectQuery = $this->db->query("SELECT user_id FROM temp_tokens WHERE token = :token AND status=true")
            ->first([
                ":token" => $temp_token
            ]);
             if (!$selectQuery) {
            return sendResponse(false, "Session Expired!!");
        }
         $user = $selectQuery['user_id'];
        $validOtp = $this->db->query("SELECT * FROM otps WHERE user_id=:user_id AND otp=:otp AND status=true")->execute([":user_id" => $user, ":otp" => $otp]);
        if (!$validOtp) {
            return sendResponse(false, "Invalid OTP!!");
        }
        return sendResponse(true, "OTP verified!!");
    }

    function resetPassword($token, $password){
        $this->clearPreviousEmailsAndOtps($token);
        $session = $this->db->query("SELECT user_id FROM temp_tokens WHERE token = :token AND expires_at > CURRENT_TIMESTAMP")
            ->first([
                ":token" => $token
            ]);
        if (!$session) {
            return sendResponse(false, "Session expired!!");
        }
        $user = $session['user_id'];
        $hashedPassword = md5($password);
        $updatedStatus =$this->db->query("UPDATE users SET password=:hashedPassword , updated_at = CURRENT_TIMESTAMP WHERE id =:user_id AND status = true")->update([":user_id" => $user, ":hashedPassword" => $hashedPassword]);
        if(!$updatedStatus){
             return sendResponse(False, "Something went Wrong Try again");
        }
        $this->db->query("UPDATE temp_tokens SET status = false , updated_at = CURRENT_TIMESTAMP WHERE token = :token")->execute([":token" => $token]);
        $this->db->query("UPDATE otps SET status = false WHERE user_id = :user_id")->execute([":user_id" => $user]);
        return sendResponse(true, "Password reset successful!!");
    }

    function logout($token){
        $logout =$this->db->query("UPDATE user_tokens SET status = false,updated_at = CURRENT_TIMESTAMP WHERE token = :token AND status = true")->execute([":token" => $token]);
        if(!$logout){
            return sendResponse(false,"something wnt Wrong");
        }
        return sendResponse(true, "Successfully logged out!!");
    }

    function validateToken($token){
        $ValidUser = $this->db->query("SELECT u.first_name,u.role,u.email from users u inner join user_tokens ut on u.id = ut.user_id where ut.token = :token AND ut.status = true AND ut.expires_at > CURRENT_TIMESTAMP ")->first([":token" => $token]);        
        if (!$ValidUser) {
            return sendResponse(false, "Expired Token!!");
        }
        $isAdmin = false;
        if (strtoupper($ValidUser['role']) === "ADMIN") {
            $isAdmin = true;
        }
        $ValidUser['isAdmin'] = $isAdmin;
        return sendResponse(true, "Valid Token!!!",$ValidUser);
    }


}