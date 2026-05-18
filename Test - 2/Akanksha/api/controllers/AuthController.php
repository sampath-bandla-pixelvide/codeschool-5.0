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
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      sendResponse(false, "Invalid email");
    }
    return true;
  }

  public static function validatePassword($password)
  {
    if (strlen($password) < 6) {
      sendResponse(false, "Password minimum 6 characters");
    }
    return true;
  }

  public static function validatePhone($phone_number)
  {
    if (!preg_match('/^[6-9][0-9]{9}$/', $phone_number)) {
      sendResponse(false, "Phone number must be 10 digits");
    }
    return true;
  }

  public function isEmailExists($email)
  {
    $query = "SELECT * FROM users WHERE email = :email";
    $this->db->query($query);

    $user = $this->db->first([
      ':email' => $email
    ]);
    return !empty($user);
  }

  public function isPhoneExists($phone_number)
  {
    $query = "SELECT * FROM users WHERE phone_number = :phone_number";
    $this->db->query($query);

    $user = $this->db->first([
      ':phone_number' => $phone_number
    ]);

    return !empty($user);
  }


  public function register($first_name, $last_name, $phone_number, $email, $password)
  {

    if (
      empty($first_name) ||
      empty($phone_number) ||
      empty($email) ||
      empty($password)
    ) {
      sendResponse(false, "All fields are required");
    }

    self::validateEmail($email);

    self::validatePhone($phone_number);

    self::validatePassword($password);

    if ($this->isEmailExists($email)) {
      sendResponse(false, "Email already exists");
    }

    if ($this->isPhoneExists($phone_number)) {
      sendResponse(false, "Phone already exists");
    }

    $hashedPassword = md5($password);

    $query = "INSERT INTO users(first_name,last_name,   phone_number,email,password)
              VALUES(:first_name,:last_name,:phone_number,:email,:password)";

    $this->db->query($query);

    $register = $this->db->create([
      ':first_name' => $first_name,
      ':last_name' => $last_name,
      ':phone_number' => $phone_number,
      ':email' => $email,
      ':password' => $hashedPassword
    ]);

    if (!$register) {
      sendResponse(false, "Registration failed");
    }

    sendResponse(true, "Registration successful");
  }


  public function login($email, $password)
  {
    if (empty($email) || empty($password)) {
      sendResponse(false, "All fields are required");
    }

    self::validateEmail($email);

    $query = "SELECT * FROM users WHERE email = :email";

    $this->db->query($query);

    $user = $this->db->first([
      ':email' => $email
    ]);

    if (empty($user)) {

      sendResponse(false, "Email not found");
    }

    if (!$user['status']) {

      sendResponse(false, "Account blocked");
    }

    if ($user['password'] !== md5($password)) {

      sendResponse(false, "Incorrect password");
    }

    $token = generateRandomString(20);

    $tokenQuery = "INSERT INTO user_tokens(user_id,token)
                  VALUES(:user_id,:token)";

    $this->db->query($tokenQuery);

    $saveToken = $this->db->create([
      ':user_id' => $user['id'],
      ':token' => $token
    ]);

    if (!$saveToken) {

      sendResponse(false, "Login failed");
    }

    session_start();

    $_SESSION['user'] = [
      "id" => $user['id'],
      "first_name" => $user['first_name'],
      "last_name" => $user['last_name'],
      "email" => $user['email'],
      "role" => $user['role']
    ];

    unset($user['password']);

    sendResponse(true, "Login successful", [
      "token" => $token,
      "user" => $_SESSION['user']
    ]);
  }


  public function validateToken($token)
  {
    $query = "SELECT * FROM user_tokens WHERE token = :token AND status = true AND expires_at > CURRENT_TIMESTAMP";

    $this->db->query($query);

    $tokenDetails = $this->db->first([
      ':token' => $token
    ]);

    if (empty($tokenDetails)) {

      return false;
    }

    if (!$tokenDetails['status']) {

      return false;
    }

    $currentTime = date('Y-m-d H:i:s');

    if ($tokenDetails['expires_at'] < $currentTime) {
      $updateQuery = "UPDATE user_tokens SET status = false, updated_at = CURRENT_TIMESTAMP WHERE token = :token";
      $this->db->query($updateQuery);

      $this->db->update([
        ':token' => $token
      ]);

      return false;
    }

    return $tokenDetails;
  }

  public function logout($token)
  {
    $query = "UPDATE user_tokens SET status = false WHERE token = :token";
    $this->db->query($query);

    $logout = $this->db->update([
      ':token' => $token
    ]);

    session_start();

    session_destroy();

    $_SESSION = [];

    if (!$logout) {

      sendResponse(false, "Logout failed");
    }

    sendResponse(true, "Logout successful");
  }
}
