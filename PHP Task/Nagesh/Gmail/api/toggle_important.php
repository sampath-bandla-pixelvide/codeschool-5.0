<?php
require_once(__DIR__ . "/../controllers/AuthController.php");
require_once(__DIR__ . "/../config/db.php");
require_once(__DIR__ . "/../config/commonfunctions.php");

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    getResponse(false, "Invalid request method");
}

$auth = new AuthController();
$user = $auth->validateToken($_POST['token'] ?? '');

$id = $_POST['id'] ?? '';

if (!$id) {
    getResponse(false, "Email ID required");
}

$db = new DB();

$db->query("
    UPDATE user_emails
    SET is_important = NOT is_important
    WHERE id = :id AND user_id = :uid
    RETURNING is_important
");

$result = $db->first([":id" => $id, ":uid" => $user['id']]);

if (!$result) {
    getResponse(false, "Email not found");
}

getResponse(true, "Updated", ["is_important" => $result['is_important']]);
