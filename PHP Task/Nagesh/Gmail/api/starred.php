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
    SET is_starred = NOT is_starred
    WHERE id = :id AND user_id = :uid
    RETURNING is_starred
");

$result = $db->first([":id" => $id, ":uid" => $user['id']]);

if (!$result) {
    getResponse(false, "Email not found");
}

getResponse(true, "Updated", ["is_starred" => $result['is_starred']]);