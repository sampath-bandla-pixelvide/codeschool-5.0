<?php
require_once(__DIR__ . "/../controllers/AuthController.php");
require_once(__DIR__ . "/../config/db.php");
require_once(__DIR__ . "/../config/commonfunctions.php");

header("Content-Type: application/json");


$auth = new AuthController();

$token = $_GET['token'] ?? '';
$user = $auth->validateToken($token);

$folder = $_GET['folder'] ?? 'inbox';
$search = $_GET['search'] ?? '';
$page = (int)($_GET['page'] ?? 1);
$limit = 25;
$offset = ($page - 1) * $limit;

$db = new DB();


if ($folder === 'inbox') {
    $folderCondition = "AND ue.folder = 'inbox' AND ue.is_deleted = FALSE AND ue.is_spam = FALSE AND ue.is_draft = FALSE";
}
elseif ($folder === 'sent') {
    $folderCondition = "AND ue.folder = 'sent'";
}
elseif ($folder === 'starred') {
    $folderCondition = "AND ue.is_starred = TRUE AND ue.is_deleted = FALSE";
}
elseif ($folder === 'important') {
    $folderCondition = "AND ue.is_important = TRUE AND ue.is_deleted = FALSE";
}
elseif ($folder === 'spam') {
    $folderCondition = "AND ue.is_spam = TRUE";
}

elseif ($folder === 'drafts' || $folder === 'draft') {
    $folderCondition = "AND ue.folder = 'drafts' AND ue.is_draft = TRUE";
}
elseif ($folder === 'trash') {
    $folderCondition = "AND ue.is_deleted = TRUE";
}
elseif ($folder === 'snoozed') {
    $folderCondition = "AND ue.folder = 'snoozed'"; 
}
else {
    getResponse(false, "Invalid folder");
}
$deletedCondition = ($folder === 'trash') ? "" : "AND ue.is_deleted = FALSE";

$searchCondition = "";
$searchParams = [];
if ($search) {
    $searchCondition = "AND (e.subject ILIKE :search OR e.body ILIKE :search OR e.sender_email ILIKE :search OR e.sender_name ILIKE :search)";
    $searchParams[":search"] = "%" . $search . "%";
}

$query = "
SELECT 
    ue.id,
    ue.folder,
    ue.is_read,
    ue.is_starred,
    ue.is_important,
    ue.is_deleted,
    e.id AS email_id,
    e.subject,
    e.body,
    e.sender_email,
    e.sender_name,
    e.created_at
FROM user_emails ue
JOIN emails e ON ue.email_id = e.id
WHERE ue.user_id = :user_id
$deletedCondition
$folderCondition
$searchCondition
ORDER BY e.created_at DESC
LIMIT :limit OFFSET :offset
";

$countQuery = "
SELECT COUNT(*) as total
FROM user_emails ue
JOIN emails e ON ue.email_id = e.id
WHERE ue.user_id = :user_id
$deletedCondition
$folderCondition
$searchCondition
";

$params = array_merge([
    ":user_id" => $user['id'],
    ":limit" => $limit,
    ":offset" => $offset
], $searchParams);

$countParams = array_merge([":user_id" => $user['id']], $searchParams);

$db->query($query);
$emails = $db->get($params);

$db->query($countQuery);
$countResult = $db->first($countParams);
$total = $countResult['total'] ?? 0;


$db->query("SELECT COUNT(*) as unread FROM user_emails WHERE user_id = :uid AND folder = 'inbox' AND is_read = FALSE AND is_deleted = FALSE");
$unreadResult = $db->first([":uid" => $user['id']]);

getResponse(true, "Emails fetched", [
    "emails" => $emails,
    "total" => (int)$total,
    "page" => $page,
    "limit" => $limit,
    "unread_count" => (int)($unreadResult['unread'] ?? 0)
]);