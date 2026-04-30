<?php
require_once(__DIR__ . "/../controllers/AuthController.php");
require_once(__DIR__ . "/../config/db.php");
require_once(__DIR__ . "/../config/commonfunctions.php");
header("Content-Type: application/json");


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    getResponse(false, "Invalid request method");
}

$token   = $_POST['token'] ?? '';
$to      = trim($_POST['to'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$body    = trim($_POST['body'] ?? '');
$cc      = trim($_POST['cc'] ?? '');


if (!$token) {
    getResponse(false, "Token missing");
}

if (!$to || !$subject || !$body) {
    getResponse(false, "To, Subject and Message are required");
}

if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    getResponse(false, "Invalid email address");
}


$auth = new AuthController();
$user = $auth->validateToken($token);

if (!$user || !isset($user['id'])) {
    getResponse(false, "Invalid or expired session");
}


$db = new DB();


$db->query("SELECT id, first_name, last_name FROM users WHERE email = :email");
$recipient = $db->first([":email" => $to]);


$thread = uniqid('thread_', true);

$db->query("INSERT INTO emails 
    (thread_id, sender_id, sender_email, sender_name, subject, body)
    VALUES (:thread, :sid, :semail, :sname, :subject, :body)
    RETURNING id
");

$result = $db->first([
    ":thread"  => $thread,
    ":sid"     => $user['id'],
    ":semail"  => $user['email'],
    ":sname"   => $user['first_name'] . ' ' . $user['last_name'],
    ":subject" => $subject,
    ":body"    => $body
]);


$emailId = ($result && isset($result['id'])) ? $result['id'] : null;

if (!$emailId) {
    getResponse(false, "Failed to create email");
}


$db->query("  INSERT INTO email_recipients (email_id, recipient_email, type)
    VALUES (:eid, :email, 'to')
");

$res1 = $db->create([
    ":eid"   => $emailId,
    ":email" => $to
]);

if (!$res1) {
    getResponse(false, "Failed to add recipient");
}


if ($recipient) {
    $db->query("INSERT INTO user_emails (user_id, email_id, folder, is_read)
        VALUES (:uid, :eid, 'inbox', FALSE)
    ");

    $res2 = $db->create([
        ":uid" => $recipient['id'],
        ":eid" => $emailId
    ]);

    if (!$res2) {
        getResponse(false, "Failed to insert into inbox");
    }
}


$db->query(" INSERT INTO user_emails (user_id, email_id, folder, is_read)
    VALUES (:uid, :eid, 'sent', TRUE)
");

$res3 = $db->create([
    ":uid" => $user['id'],
    ":eid" => $emailId
]);

if (!$res3) {
    getResponse(false, "Failed to insert into sent folder");
}


getResponse(true, "Email sent successfully", [
    "email_id" => $emailId
]);