
<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: index.html");
    exit;
}
require_once "utils/pdo.php";
$pdo = getPDO();
$stmt = $pdo->prepare("SELECT first_name, last_nameFROM users WHERE id = :id");
$stmt->execute([':id' => $_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
?>