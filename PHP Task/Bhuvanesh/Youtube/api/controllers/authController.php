<?php

require __DIR__ . "/../utils/db.php";
require __DIR__ . "/../utils/function.php";

class authController{
 private $db = NULL;
    function __construct()
    {
        $this->db = new DB();
    }
    function checkEmail($email){
        $checkQuery = "SELECT * FROM users WHERE email = :email";
        $user = $this->db->query($checkQuery)->first([":email" => $email]);
        if ($user) {
             $temp_token = generateRandomString(15);
            $insertQuery = "INSERT INTO user_temp_tokens(temp_token,user_id) VALUES(:temp_token,:user_id)";
            $insertStatus = $this->db->query($insertQuery)->execute([
                ":temp_token" => $temp_token,
                ":user_id" => $user['id']
            ]);
            if(!$insertStatus){
                sendResponse(false,"DatabaseError! Try again Later");
            }
            $otp = rand(100000, 999999);
            $hashed_otp =md5($otp);
            $insert_query = "INSERT INTO otps(otp_code,user_id) VALUES(:otp_code,:user_id)";
            $insert_status = $this->db->query($insert_query)->execute([
                ":otp_code" => $hashed_otp,
                ":user_id" => $user['id']
            ]);
            $temp = [
                "temp_token" => $temp_token,
                "otp" =>$otp
            ];
            if(!$insert_status){
                sendResponse(false,"DatabaseError! Try again Later");
            }
            sendResponse(true,'user-found',$temp);
        }
        sendResponse(false,"no email Exist! or pls check the email");
    }
    function auth_tempToken($temp_token){
         $checkQuery = "SELECT * FROM user_temp_tokens  WHERE temp_token = :temp_token AND is_active = TRUE AND expires_at > NOW()";
         $user = $this->db->query($checkQuery)->first([":temp_token"=>$temp_token]);
            if (!$user) {
            $updateQuery = "UPDATE user_temp_tokens SET is_active = false WHERE temp_token = :temp_token AND expires_at <= NOW()";
           $updateStatus = $this->db->query($updateQuery)->update([":temp_token" => $temp_token]);
           if(!$updateStatus){
                sendResponse(false,"DatabaseError! Try again Later");
            }

            return sendResponse(false, "Session Expired! Try again Later");
        }

        return sendResponse(true,"",$user);
         }
     function getOTP($temp_token){
         $checkQuery = "SELECT * FROM user_temp_tokens WHERE temp_token = :temp_token AND is_active = TRUE AND expires_at > NOW()";
         $user = $this->db->query($checkQuery)->first([":temp_token"=>$temp_token]);
            if (!$user) {
            $updateQuery = "UPDATE user_temp_tokens SET is_active = false WHERE temp_token = :temp_token AND expires_at <= NOW()";
           $updateStatus = $this->db->query($updateQuery)->update([":temp_token" => $temp_token]);
           if(!$updateStatus){
                sendResponse(false,"DatabaseError! Try again Later");
            }

            return sendResponse(false, "Session Expired! Try again Later");
        }
        $user_id = $user['user_id'];
         $otp = rand(100000, 999999);
            $hashed_otp = md5($otp);
            $insert_query = "INSERT INTO otps(otp_code,user_id) VALUES(:otp_code,:user_id)";
            $insert_status = $this->db->query($insert_query)->execute([
                ":otp_code" => $hashed_otp,
                ":user_id" => $user_id
            ]);
            if(!$insert_status){
                sendResponse(false,"DatabaseError! Try again Later");
            }
            sendResponse(true,"otp",["otp"=>$otp]);
    }
    function clearExpiredOtps(){
                $updateQuery = "UPDATE otps SET is_active = false where otp_expires_at <= current_timestamp";
                $this->db->query($updateQuery)->execute([]);
}
    function verifyOtp($otp){

       $hashed_otp =md5($otp);
       $checkQuery = "SELECT * FROM otps WHERE otp_code = :otp_code AND is_active = TRUE AND otp_expires_at > NOW()";
       $user = $this->db->query($checkQuery)->first([":otp_code"=>$hashed_otp]);
            if (!$user) {
            $updateQuery = "UPDATE otps SET is_active = false WHERE otp_code = :otp_code AND otp_expires_at<= NOW()";
           $updateStatus = $this->db->query($updateQuery)->update([":otp_code" => $hashed_otp]);
           if(!$updateStatus){
                sendResponse(false,"DatabaseError! Try again Later");
            }

            return sendResponse(false, "Try again! otp Incorrect");
        }
           $token = generateRandomString(10);
            date_default_timezone_set("Asia/Kolkata");
            $expireAt = date('Y-m-d H:i:s', strtotime('10 days'));
            $insertQuery = "INSERT INTO user_tokens(token,user_id,expires_at) VALUES(:token,:user_id,:expires_at)";
            $insertStatus = $this->db->query($insertQuery)->execute([
                ":token" => $token,
                ":user_id" => $user['user_id'],
                ":expires_at" => $expireAt
            ]);
            if(!$insertStatus){
                sendResponse(false,"DatabaseError! Try again Later");
            }
            $this->clearExpiredOtps();
            
        return sendResponse(true,'Welcome User',$token);
    }
     function logout($token)
    {
        $selectQuery = "SELECT user_id from user_tokens where token = :token";
        $user = $this->db->query($selectQuery)->first([":token" => $token]);
        if (!$user) {
            return sendResponse(false, "LogoutFailed");
        }

        $updateQuery = "UPDATE user_tokens SET is_active = FALSE WHERE user_id = :user_id";
        $logout = $this->db->query($updateQuery)->update([":user_id" => $user['user_id']]);
        if ($logout) {
            return sendResponse(true, "Logout Successful");
        } else {
            return sendResponse(false, "Logout Failed");
        }
    }
    function authToken($token){
         $checkQuery = "SELECT * FROM user_tokens ut inner join users u on ut.user_id = u.id  WHERE token = :token AND is_active = TRUE AND expires_at > NOW()";
         $user = $this->db->query($checkQuery)->first([":token"=>$token]);
            if (!$user) {
            $updateQuery = "UPDATE user_tokens SET is_active = false WHERE token = :temp_token AND expires_at <= NOW()";
           $updateStatus = $this->db->query($updateQuery)->update([":token" => $token]);
           if(!$updateStatus){
                sendResponse(false,"DatabaseError! Try again Later");
            }

            return sendResponse(false, "Session Expired! Try again Later");
        }

        return sendResponse(true,"",$user);
         }

function likes($token, $liked, $video_id) {
    if (empty($token)) {
        return sendResponse(false, "token is null");
    }

    $checkQuery = "SELECT user_id FROM user_tokens 
                   WHERE token = :token AND is_active = TRUE AND expires_at > NOW()";
    $user = $this->db->query($checkQuery)->first([":token" => $token]);
    if (!$user) {
        return sendResponse(false, "Unauthorized");
    }
    $user_id = $user['user_id'];

    $liked = filter_var($liked, FILTER_VALIDATE_BOOLEAN);

    if ($liked) {
        
        $insertQuery = "INSERT INTO user_video_likes(user_id, video_id) 
                        VALUES(:user_id, :video_id) 
                        ON CONFLICT (user_id, video_id) DO NOTHING";
        $inserted = $this->db->query($insertQuery)->create([":user_id"=>$user_id, ":video_id"=>$video_id]);

        if ($inserted) {
            
            $updateQuery = "UPDATE videos SET likes = likes + 1 , liked = true WHERE id = :video_id ";
            $this->db->query($updateQuery)->update([":video_id"=>$video_id]);
        }
    } else {
        
        $deleteQuery = "DELETE FROM user_video_likes WHERE user_id = :user_id AND video_id = :video_id";
        $deleted = $this->db->query($deleteQuery)->delete([":user_id"=>$user_id, ":video_id"=>$video_id]);

        if ($deleted) {
            
            $updateQuery = "UPDATE videos SET likes = GREATEST(likes - 1, 0) , liked = false WHERE id = :video_id";
            $this->db->query($updateQuery)->update([":video_id"=>$video_id]);
        }
    }

    
    $selectQuery = "SELECT likes FROM videos WHERE id = :video_id";
    $likeCount = $this->db->query($selectQuery)->first([":video_id"=>$video_id]);

    return sendResponse(true, "", $likeCount);
}

function comments($token, $comment, $video_id){
    if (empty($token)) {
        return sendResponse(false, "token is null");
    }

    $checkQuery = "SELECT user_id FROM user_tokens 
                   WHERE token = :token AND is_active = TRUE AND expires_at > NOW()";
    $user = $this->db->query($checkQuery)->first([":token" => $token]);
    if (!$user) {
        return sendResponse(false, "Unauthorized");
    }

    $user_id = $user['user_id'];

    $insertQuery = "INSERT INTO video_comments(user_id, video_id, comment_text) 
                    VALUES(:user_id, :video_id, :comment)";
    $inserted = $this->db->query($insertQuery)->create([
        ":user_id"=>$user_id, 
        ":video_id"=>$video_id,
        ":comment"=>$comment
    ]);

    if ($inserted) {
        $selectQuery = "SELECT u.username, vc.comment_text, vc.video_id
                        FROM video_comments vc
                        INNER JOIN users u ON vc.user_id = u.id
                        WHERE vc.video_id = :video_id";
        $comments = $this->db->query($selectQuery)->first([":video_id"=>$video_id]);
        if ($comments) {
            return sendResponse(true, "Commented successfully", $comments);
        }
        return sendResponse(false, "Database Error! post again later");
    }
    return sendResponse(false, "Database Error! post again later");  
}
function display_comments($video_id){
    $selectQuery = "SELECT u.username , vc.comment_text from video_comments vc inner join users u on vc.user_id = u.id where video_id = :video_id";
    $comments = $this->db->query($selectQuery)->get([":video_id"=>$video_id]);
      if ($comments) {
            return sendResponse(true, "Commented successfully", $comments);
        }
        return sendResponse(false, "Database Error! post again later");
    
}


}

