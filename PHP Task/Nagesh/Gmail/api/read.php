<?php
require_once(__DIR__ . "/../controllers/AuthController.php");
require_once(__DIR__ . "/../config/db.php");
require_once(__DIR__ . "/../config/commonfunctions.php");

header("Content-Type: application/json");

$auth = new AuthController();
$token = $_GET['token'] ?? '';
$user = $auth->validateToken($token);

$id = $_GET['id'] ?? '';

if (!$id) {
    getResponse(false, "Email ID required");
}

$db = new DB();


$db->query("UPDATE user_emails SET is_read = TRUE WHERE id = :id AND user_id = :uid");
$db->update([":id" => $id, ":uid" => $user['id']]);


$db->query("
SELECT 
    e.id AS email_id,
    e.subject,
    e.body,
    e.sender_email,
    e.sender_name,
    e.created_at,
    ue.id AS ue_id,
    ue.is_read,
    ue.is_starred,
    ue.is_important,
    ue.folder
FROM emails e
JOIN user_emails ue ON ue.email_id = e.id
WHERE ue.id = :id AND ue.user_id = :uid
");

$mail = $db->first([":id" => $id, ":uid" => $user['id']]);

if (!$mail) {
    getResponse(false, "Email not found");
}


$db->query("SELECT recipient_email, recipient_name, type FROM email_recipients WHERE email_id = :eid");
$recipients = $db->get([":eid" => $mail['email_id']]);
$mail['recipients'] = $recipients;

getResponse(true, "Email fetched", $mail);