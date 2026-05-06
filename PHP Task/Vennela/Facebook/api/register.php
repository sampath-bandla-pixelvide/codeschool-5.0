<?php
require_once __DIR__ . "/../utils/pdo.php";
require_once __DIR__ . "/../validations/functions.php";

$pdo = getPDO();
$first_name = trim($_POST['first_name'] ?? '');
$last_name  = trim($_POST['last_name'] ?? '');
$day        = $_POST['day'] ?? '';
$month      = $_POST['month'] ?? '';
$year       = $_POST['year'] ?? '';
$gender     = $_POST['gender'] ?? '';
$contact    = trim($_POST['contact'] ?? '');
$password   = trim($_POST['password'] ?? '');
if (
    $first_name === '' || $last_name === '' ||
    $day === '' || $month === '' || $year === '' ||
    $gender === '' || $contact === '' || $password === ''
) {
    echo "empty_error";
    exit();
}
$dob = "$year-$month-$day";
if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
    $email = strtolower($contact);
    $mobile = null;
} else {
    $email = null;
    $mobile = $contact;
}
if ($email) {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute(['email' => $email]);
} else {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE mobile = :mobile");
    $stmt->execute(['mobile' => $mobile]);
}
if ($stmt->fetch()) {
    echo "exists";
    exit();
}
$hashedPassword = md5($password);
$insert = $pdo->prepare("
    INSERT INTO users 
    (first_name, last_name, dob, gender, email, mobile, password)
    VALUES 
    (:first_name, :last_name, :dob, :gender, :email, :mobile, :password)
");
session_start();
$insert->execute([
    'first_name' => $first_name,
    'last_name'  => $last_name,
    'dob'        => $dob,
    'gender'     => $gender,
    'email'      => $email,
    'mobile'     => $mobile,
    'password'   => $hashedPassword
]);
$user_id = $pdo->lastInsertId();
$_SESSION['user_id'] = $user_id;
echo "success";
