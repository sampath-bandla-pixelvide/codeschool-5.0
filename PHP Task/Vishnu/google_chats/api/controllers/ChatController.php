<?php

require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";

class ChatController
{
    private $db = null;

    public function __construct()
    {
        $this->db = new DB();
    }


    public function getUserIdFromToken($token)
    {
        if (!$token) return null;

        $this->db->query(
            "SELECT user_id FROM users_token
             WHERE token = :token AND expires_at > NOW()
             LIMIT 1"
        );
        $row = $this->db->first([":token" => $token]);
        return $row ? $row["user_id"] : null;
    }


    public function getConversations($userId)
    {
        $db = new DB();
        $db->query(
            "SELECT
                u.id AS user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.profile_picture,
                m.message_content AS last_message,
                m.send_at AS last_time,
                COALESCE(unread.cnt, 0) AS unread_count
             FROM (
                SELECT
                    CASE
                        WHEN message_from = :uid THEN message_to
                        ELSE message_from
                    END AS other_user_id,
                    MAX(id) AS last_msg_id
                FROM messages
                WHERE (message_from = :uid2 OR message_to = :uid3)
                  AND deleted = FALSE
                GROUP BY other_user_id
             ) sub
             JOIN messages m ON m.id = sub.last_msg_id
             JOIN users u ON u.id = sub.other_user_id
             LEFT JOIN (
                SELECT message_from, COUNT(*) AS cnt
                FROM messages
                WHERE message_to = :uid4
                  AND status = FALSE
                  AND deleted = FALSE
                GROUP BY message_from
             ) unread ON unread.message_from = sub.other_user_id
             ORDER BY m.send_at DESC"
        );
        $conversations = $db->get([
            ":uid"  => $userId,
            ":uid2" => $userId,
            ":uid3" => $userId,
            ":uid4" => $userId,
        ]);

        sendResponse(true, "Conversations fetched.", ["conversations" => $conversations]);
    }


    public function searchUser($email, $currentUserId)
    {
        if (!$email) {
            sendResponse(false, "Email is required.");
        }

        $db = new DB();
        $db->query(
            "SELECT id, first_name, last_name, email, profile_picture
             FROM users
             WHERE email = :email AND id != :uid
             LIMIT 1"
        );
        $user = $db->first([":email" => $email, ":uid" => $currentUserId]);

        if (!$user) {
            sendResponse(false, "No user found with this email.");
        }

        sendResponse(true, "User found.", ["user" => $user]);
    }


    public function getMessages($userId, $otherUserId)
    {

        $dbRead = new DB();
        $dbRead->query(
            "UPDATE messages SET status = TRUE
             WHERE message_from = :oid AND message_to = :uid AND status = FALSE"
        );
        $dbRead->update([":oid" => $otherUserId, ":uid" => $userId]);

        $db = new DB();
        $db->query(
            "SELECT m.id, m.message_from, m.message_to, m.message_content,
                    m.is_media, m.send_at, u.first_name, u.last_name, u.profile_picture,
                    CASE WHEN sm.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_starred
             FROM messages m
             JOIN users u ON u.id = m.message_from
             LEFT JOIN starred_messages sm ON sm.message_id = m.id AND sm.user_id = :uid_star
             WHERE ((m.message_from = :uid AND m.message_to = :oid)
                OR  (m.message_from = :oid2 AND m.message_to = :uid2))
               AND m.deleted = FALSE
             ORDER BY m.send_at ASC"
        );
        $messages = $db->get([
            ":uid"      => $userId,
            ":oid"      => $otherUserId,
            ":oid2"     => $otherUserId,
            ":uid2"     => $userId,
            ":uid_star" => $userId,
        ]);

        sendResponse(true, "Messages fetched.", ["messages" => $messages]);
    }


    public function sendMessage($fromId, $toId, $content)
    {
        if (!$content || !trim($content)) {
            sendResponse(false, "Message cannot be empty.");
        }

        $db = new DB();
        $db->query(
            "INSERT INTO messages (message_from, message_to, message_content)
             VALUES (:from, :to, :content)
             RETURNING id, message_from, message_to, message_content, send_at"
        );
        $msg = $db->first([
            ":from"    => $fromId,
            ":to"      => $toId,
            ":content" => trim($content),
        ]);

        if ($msg) {
            $this->saveMentions($msg['id'], $fromId, trim($content));
        }

        sendResponse(true, "Message sent.", ["message" => $msg]);
    }

    public function saveMentions($messageId, $fromId, $content)
    {
        preg_match_all('/@([A-Za-z]+\s[A-Za-z]+)/', $content, $matches);

        if (empty($matches[1])) return;

        foreach ($matches[1] as $fullName) {
            $parts = explode(' ', $fullName, 2);
            $firstName = $parts[0];
            $lastName = $parts[1] ?? '';

            $db = new DB();
            $db->query(
                "SELECT id FROM users
                 WHERE first_name = :fname AND last_name = :lname AND id != :from
                 LIMIT 1"
            );
            $mentionedUser = $db->first([
                ":fname" => $firstName,
                ":lname" => $lastName,
                ":from"  => $fromId,
            ]);

            if ($mentionedUser) {
                $db2 = new DB();
                $db2->query(
                    "INSERT INTO mentions (message_id, mentioned_user_id, mentioned_by)
                     VALUES (:mid, :uid, :by)"
                );
                $db2->first([
                    ":mid" => $messageId,
                    ":uid" => $mentionedUser['id'],
                    ":by"  => $fromId,
                ]);
            }
        }
    }


    public function sendMedia($fromId, $toId, $file)
    {
        $uploadDir = __DIR__ . '/../chat_images/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file['type'], $allowed)) {
            sendResponse(false, "Only images (JPG, PNG, GIF, WEBP) are allowed.");
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('img_') . '.' . $ext;
        $destination = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            sendResponse(false, "Failed to upload file.");
        }

        $relativePath = './api/chat_images/' . $filename;

        $db = new DB();
        $db->query(
            "INSERT INTO messages (message_from, message_to, message_content, is_media)
             VALUES (:from, :to, :content, TRUE)
             RETURNING id, message_from, message_to, message_content, is_media, send_at"
        );
        $msg = $db->first([
            ":from"    => $fromId,
            ":to"      => $toId,
            ":content" => $relativePath,
        ]);

        sendResponse(true, "Image sent.", ["message" => $msg]);
    }


    public function updateStatus($userId, $status)
    {
        $allowed = ['active', 'dnd', 'away'];
        if (!in_array($status, $allowed)) {
            sendResponse(false, "Invalid status.");
        }

        $db = new DB();
        $db->query("UPDATE users SET status = :status WHERE id = :uid");
        $db->update([":status" => $status, ":uid" => $userId]);

        sendResponse(true, "Status updated.", ["status" => $status]);
    }


    public function getUserDetails($targetUserId)
    {
        $db = new DB();
        $db->query(
            "SELECT id, first_name, last_name, email, status, created_at, profile_picture
             FROM users WHERE id = :uid LIMIT 1"
        );
        $user = $db->first([":uid" => $targetUserId]);

        if (!$user) {
            sendResponse(false, "User not found.");
        }

        sendResponse(true, "User details.", ["user" => $user]);
    }

    public function getChatUsers($userId)
    {
        $db = new DB();
        $db->query(
            "SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, u.profile_picture
             FROM users u
             WHERE u.id IN (
                 SELECT DISTINCT message_to FROM messages WHERE message_from = :uid1 AND deleted = FALSE
                 UNION
                 SELECT DISTINCT message_from FROM messages WHERE message_to = :uid2 AND deleted = FALSE
             )
             ORDER BY u.first_name ASC"
        );
        $users = $db->get([":uid1" => $userId, ":uid2" => $userId]);

        sendResponse(true, "Chat users fetched.", ["users" => $users]);
    }

    public function validateToken($token)
    {
        if (!$token) sendResponse(false, "Token required.");

        $db = new DB();
        $db->query(
            "SELECT u.id, u.first_name, u.last_name, u.email, u.status, u.profile_picture
             FROM users_token ut
             JOIN users u ON u.id = ut.user_id
             WHERE ut.token = :token AND ut.expires_at > NOW()
             LIMIT 1"
        );
        $user = $db->first([":token" => $token]);

        if (!$user) {
            sendResponse(false, "Invalid or expired token.");
        }

        sendResponse(true, "Authenticated.", ["user" => $user]);
    }




    public function getMentions($userId)
    {
        $db = new DB();
        $db->query(
            "SELECT m.id, m.message_from, m.message_to, m.message_content,
                    m.is_media, m.send_at, u.first_name, u.last_name, u.profile_picture
             FROM mentions mt
             JOIN messages m ON m.id = mt.message_id
             JOIN users u ON u.id = m.message_from
             WHERE mt.mentioned_user_id = :uid
               AND m.deleted = FALSE
             ORDER BY m.send_at DESC
             LIMIT 50"
        );
        $messages = $db->get([":uid" => $userId]);

        sendResponse(true, "Mentions fetched.", ["messages" => $messages]);
    }

    public function toggleStar($userId, $messageId)
    {
        $db = new DB();
        $db->query("SELECT id FROM starred_messages WHERE user_id = :uid AND message_id = :mid");
        $exists = $db->first([":uid" => $userId, ":mid" => $messageId]);

        $dbWrite = new DB();
        if ($exists) {
            $dbWrite->query("DELETE FROM starred_messages WHERE user_id = :uid AND message_id = :mid");
            $dbWrite->update([":uid" => $userId, ":mid" => $messageId]);
            sendResponse(true, "Message unstarred.", ["starred" => false]);
        } else {
            $dbWrite->query("INSERT INTO starred_messages (user_id, message_id) VALUES (:uid, :mid)");
            $dbWrite->update([":uid" => $userId, ":mid" => $messageId]);
            sendResponse(true, "Message starred.", ["starred" => true]);
        }
    }

    public function getStarredMessages($userId)
    {
        $db = new DB();
        $db->query(
            "SELECT m.id, m.message_from, m.message_to, m.message_content,
                    m.is_media, m.send_at, u.first_name, u.last_name, u.profile_picture,
                    TRUE AS is_starred,
                    CASE WHEN m.message_from = :uid1 THEN m.message_to ELSE m.message_from END as chat_partner_id
             FROM starred_messages sm
             JOIN messages m ON m.id = sm.message_id
             JOIN users u ON u.id = CASE WHEN m.message_from = :uid2 THEN m.message_to ELSE m.message_from END
             WHERE sm.user_id = :uid3
               AND m.deleted = FALSE
             ORDER BY sm.created_at DESC"
        );
        $messages = $db->get([
            ":uid1" => $userId,
            ":uid2" => $userId,
            ":uid3" => $userId
        ]);

        sendResponse(true, "Starred messages fetched.", ["messages" => $messages]);
    }
}
