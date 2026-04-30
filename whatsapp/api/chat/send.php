 <?php
/*require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../middleware/auth.php');
require_once(__DIR__ . '/../controllers/ChatController.php');

$user = verifyToken();

$conversation_id = $_POST['conversation_id'] ?? '';
$content = trim($_POST['content'] ?? '');

if (!$conversation_id || !$content) {
    sendResponse(false, "conversation_id and content required");
}

$controller = new ChatController();
$message = $controller->sendMessage($conversation_id, $user['id'], $content);

sendResponse(true, "Message sent", $message); */


require_once(__DIR__ . '/../config/db.php');
require_once(__DIR__ . '/../functions.php');
require_once(__DIR__ . '/../middleware/auth.php');
require_once(__DIR__ . '/../controllers/ChatController.php');

$user = verifyToken();

$conversation_id = $_POST['conversation_id'] ?? '';
$type = $_POST['message_type'] ?? 'text';
$content = trim($_POST['content'] ?? '');

if (!$conversation_id) {
    sendResponse(false, "conversation_id required");
}

//  only check content for text
if ($type === 'text' && !$content) {
    sendResponse(false, "content required for text message");
}

$controller = new ChatController();

$message = $controller->sendMessage(
    $conversation_id,
    $user['id'],
    $content,
    $type,
    $_FILES['file'] ?? null
);

sendResponse(true, "Message sent", $message);