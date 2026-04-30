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
$action = $_POST['action'] ?? 'trash'; 

if (!$id) {
    getResponse(false, "Email ID required");
}

$db = new DB();

if ($action === 'trash') {
    $db->query("UPDATE user_emails SET is_deleted = TRUE WHERE id = :id AND user_id = :uid");
    $db->update([":id" => $id, ":uid" => $user['id']]);
    getResponse(true, "Moved to trash");
} else {
    getResponse(false, "Invalid action");
}
