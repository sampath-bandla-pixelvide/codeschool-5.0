<?php

require_once(__DIR__ . "/../config/db.php");
require_once(__DIR__ . "/../config/commonfunctions.php");
require_once(__DIR__ . "/../controllers/AuthController.php");

header("Content-Type: application/json");

$auth = new AuthController();
$user = $auth->validateToken($_POST['token'] ?? '');

if (!$user) {
    getResponse(false, "Invalid token");
}

$subject = $_POST['subject'] ?? '';
$body    = $_POST['body'] ?? '';

$db = new DB();


$db->query("
INSERT INTO emails (thread_id, sender_id, sender_email, subject, body)
VALUES (:thread, :sid, :semail, :subject, :body)
RETURNING id
");

$email = $db->first([
    ":thread"  => uniqid("thread_"),
    ":sid"     => $user['id'],
    ":semail"  => $user['email'],
    ":subject" => $subject,
    ":body"    => $body
]);

if (!$email) {
    getResponse(false, "Failed to create draft");
}

$emailId = $email['id'];


$db->query("INSERT INTO user_emails (user_id, email_id, folder, is_draft, is_deleted)
VALUES (:uid, :eid, 'drafts', TRUE, FALSE)
");

$db->execute([
    ":uid" => $user['id'],
    ":eid" => $emailId
]);

getResponse(true, "Draft saved");
