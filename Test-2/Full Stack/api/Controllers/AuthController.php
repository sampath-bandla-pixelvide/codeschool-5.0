<?php
require_once __DIR__ . "/../Utils/db.php";
require_once __DIR__ . "/../Utils/functions.php";

class AuthControllers
{
    private $db = null;

    function __construct()
    {
        $this->db = new DB();
    }
    private function clearExpiredOtps()
    {
        $this->db->query(
            "UPDATE otps
         SET status = FALSE
         WHERE otp_expires_at <= CURRENT_TIMESTAMP"
        )->execute();
    }
    public function register($first_name, $last_name, $email, $phone_number, $date_of_birth, $password)
    {
        $userExist = $this->db->query("SELECT 1 FROM users WHERE email = :email OR phone_number = :phone_number")->get([":email" => $email, ":phone_number" => $phone_number]);

        if ($userExist) {
            return sendResponse(false, "User already exists!!");
        }

        $hashedPassword = md5($password);

        $this->db->query("INSERT INTO users (first_name, last_name, email, phone_number, date_of_birth, password) VALUES (:first_name, :last_name, :email, :phone_number, :date_of_birth, :password)")
            ->execute([
                ":first_name" => $first_name,
                ":last_name" => $last_name,
                ":email" => $email,
                ":phone_number" => $phone_number,
                ":date_of_birth" => $date_of_birth,
                ":password" => $hashedPassword
            ]);

        return sendResponse(true, "Registration successful!!");
    }
    public function login($login_input, $password, $rememberMe)
    {
        $hashedPassword = md5($password);

        $user = $this->db->query(
            "SELECT id, role 
         FROM users 
         WHERE (
            email = :login_input
            OR phone_number = :login_input
         )
         AND password = :password
         AND status = true"
        )->get([
            ":login_input" => $login_input,
            ":password" => $hashedPassword
        ]);

        if (!$user) {
            return sendResponse(
                false,
                "Invalid email or password!!"
            );
        }

        $token = generateUserToken();

        $this->db->query(
            "INSERT INTO user_tokens 
        (user_id, token) 
        VALUES (:id, :token)"
        )->execute([
            ":id" => $user["id"],
            ":token" => $token
        ]);

        if ($rememberMe) {

            $this->db->query(
                "UPDATE user_tokens 
             SET expires_at = CURRENT_TIMESTAMP + interval '10 days'
             WHERE token = :token"
            )->execute([
                ":token" => $token
            ]);
        }

        return sendResponse(
            true,
            "Login successful!!",
            [
                "token" => $token,
                "role" => $user["role"]
            ]
        );
    }

    public function forgotPassword($forgot_input)
    {
        $this->clearExpiredOtps();

        $user = $this->db->query(
            "SELECT id, email, phone_number
         FROM users
         WHERE (
            email = :forgot_input
            OR phone_number = :forgot_input
         )
         AND status = true"
        )->get([
            ":forgot_input" => $forgot_input
        ]);

        if (!$user) {

            return sendResponse(
                false,
                "Account does not exist!"
            );
        }

        // Generate OTP
        $otp = random_int(100000, 999999);

        // Generate temp token
        $temp_token = generateUserToken();

        // Disable old OTPs
        $this->db->query(
            "UPDATE otps
         SET status = FALSE
         WHERE email = :email
         OR phone_number = :phone_number"
        )->execute([
            ":email" => $user["email"],
            ":phone_number" => $user["phone_number"]
        ]);

        // Insert OTP
        $this->db->query(
            "INSERT INTO otps
        (
            email,
            phone_number,
            otp
        )
        VALUES
        (
            :email,
            :phone_number,
            :otp
        )"
        )->execute([
            ":email" => $user["email"],
            ":phone_number" => $user["phone_number"],
            ":otp" => $otp
        ]);

        // Insert temp token
        $this->db->query(
            "INSERT INTO temp_tokens
        (
            email,
            phone_number,
            token
        )
        VALUES
        (
            :email,
            :phone_number,
            :token
        )"
        )->execute([
            ":email" => $user["email"],
            ":phone_number" => $user["phone_number"],
            ":token" => $temp_token
        ]);

        return sendResponse(
            true,
            "OTP sent successfully!",
            [
                "otp" => $otp,
                "temp_token" => $temp_token
            ]
        );
    }
    public function verifyOtp($temp_token, $otp)
    {
        $this->clearExpiredOtps();

        $tempSession = $this->db->query(
            "SELECT email, phone_number
         FROM temp_tokens
         WHERE token = :token
         AND status = true
         AND expires_at > CURRENT_TIMESTAMP"
        )->get([
            ":token" => $temp_token
        ]);

        if (!$tempSession) {

            return sendResponse(
                false,
                "Session expired!"
            );
        }

        $validOtp = $this->db->query(
            "SELECT 1
     FROM otps
     WHERE (
        email = :email
        OR phone_number = :phone_number
     )
     AND otp = :otp
     AND status = true
     AND otp_expires_at > CURRENT_TIMESTAMP"
        )->get([
            ":email" => $tempSession["email"],
            ":phone_number" => $tempSession["phone_number"],
            ":otp" => $otp
        ]);

        if (!$validOtp) {

            return sendResponse(
                false,
                "Invalid OTP!"
            );
        }

        return sendResponse(
            true,
            "OTP verified successfully!"
        );
    }
    public function resendOtp($temp_token)
    {
        $tempSession = $this->db->query(
            "SELECT email, phone_number
         FROM temp_tokens
         WHERE token = :token
         AND status = true
         AND expires_at > CURRENT_TIMESTAMP"
        )->get([
            ":token" => $temp_token
        ]);

        if (!$tempSession) {

            return sendResponse(
                false,
                "Session expired!"
            );
        }

        $otp = random_int(100000, 999999);

        // Disable old OTPs
        $this->db->query(
            "UPDATE otps
         SET status = FALSE
         WHERE email = :email
         OR phone_number = :phone_number"
        )->execute([
            ":email" => $tempSession["email"],
            ":phone_number" => $tempSession["phone_number"]
        ]);

        // Insert new OTP
        $this->db->query(
            "INSERT INTO otps
        (
            email,
            phone_number,
            otp
        )
        VALUES
        (
            :email,
            :phone_number,
            :otp
        )"
        )->execute([
            ":email" => $tempSession["email"],
            ":phone_number" => $tempSession["phone_number"],
            ":otp" => $otp
        ]);

        return sendResponse(
            true,
            "OTP resent successfully!",
            [
                "otp" => $otp
            ]
        );
    }
    public function resetPassword($temp_token, $password)
    {
        $tempSession = $this->db->query(
            "SELECT email
         FROM temp_tokens
         WHERE token = :token
         AND status = true
         AND expires_at > CURRENT_TIMESTAMP"
        )->get([
            ":token" => $temp_token
        ]);

        if (!$tempSession) {

            return sendResponse(
                false,
                "Session expired!"
            );
        }

        $hashedPassword = md5($password);

        $this->db->query(
            "UPDATE users
         SET password = :password
         WHERE email = :email"
        )->execute([
            ":password" => $hashedPassword,
            ":email" => $tempSession["email"]
        ]);

        // Disable used OTPs
        $this->db->query(
            "UPDATE otps
         SET status = FALSE
         WHERE email = :email"
        )->execute([
            ":email" => $tempSession["email"]
        ]);

        return sendResponse(
            true,
            "Password reset successful!"
        );
    }
    public function validateToken($token)
    {
        $user = $this->db->query(
            "SELECT 
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone_number
         FROM user_tokens ut
         INNER JOIN users u
         ON ut.user_id = u.id
         WHERE ut.token = :token
         AND ut.status = true
         AND ut.expires_at > CURRENT_TIMESTAMP"
        )->get([
            ":token" => $token
        ]);

        if (!$user) {

            return sendResponse(
                false,
                "Invalid or expired token!"
            );
        }

        return sendResponse(
            true,
            "Valid token!",
            $user
        );
    }
    public function logout($token)
    {
        $this->db->query(
            "UPDATE user_tokens
         SET status = false
         WHERE token = :token"
        )->execute([
            ":token" => $token
        ]);

        return sendResponse(
            true,
            "Logout successful!"
        );
    }
}
