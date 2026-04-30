<?php
require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";

class ContactsControllers
{
    private $db = null;
    function __construct()
    {
        $this->db = new DB();
    }

    private function getUserIdByToken($token)
    {
        $userId = $this->db->query("SELECT user_id FROM user_tokens WHERE token=:token AND expires_at>CURRENT_TIMESTAMP AND status=TRUE")->get([":token" => $token]);
        return $userId;
    }

    public function getUserContacts($token)
    {
        $currentUserData = $this->getUserIdByToken($token);
        $userId = $currentUserData['user_id'];
        $contactList = $this->db->query("SELECT username,photo,u.is_online FROM user_contacts uc inner join users u ON uc.friend_id=u.id where uc.user_id = :id AND status=TRUE;")->getAll([":id" => $userId]);
        return sendResponse(true, "contacts list fetched!!", $contactList);
    }

    public function searchContactByUsername($searchInput, $token)
    {
        $userId = $this->getUserIdByToken($token);
        $pattern = $searchInput . '%';
        $users = $this->db->query("SELECT u.username,u.photo,u.bio, (uc.friend_id IS NOT NULL AND status=true) AS is_friend FROM users AS u LEFT JOIN user_contacts AS uc ON uc.friend_id = u.id AND uc.user_id=:id WHERE username ILIKE :pattern AND u.id!=:id")->getAll([":pattern" => $pattern, ":id" => $userId['user_id']]);
        if (!empty($users)) {
            return sendResponse(true, "contacts found!!", $users);
        }
        return sendResponse(false, "contacts not found!!");
    }

    public function sendFriendRequest($username, $token)
    {
        $FromUserId = $this->getUserIdByToken($token);
        $toUserId = $this->db->query("SELECT id FROM users WHERE username=:username")->get([":username" => $username]);
        if ($FromUserId['user_id'] == $toUserId['id']) {
            return sendResponse(false, "cannot send friend request to self");
        }
        $requestPending = $this->db->query("SELECT 1 FROM user_friend_request_notifications WHERE from_user=:fromUser AND to_user=:toUser")->get([":fromUser" => $FromUserId['user_id'], ":toUser" => $toUserId['id']]);
        if ($requestPending) {
            return sendResponse(false, "request still pending!!");
        }
        $this->db->query("INSERT INTO user_friend_request_notifications (from_user,to_user) VALUES (:fromUser,:toUser)")->execute([":fromUser" => $FromUserId['user_id'], ":toUser" => $toUserId['id']]);
        return sendResponse(true, "request send successfully");
    }

    public function getNotifications($token)
    {
        $userId = $this->getUserIdByToken($token);
        $id = $userId['user_id'];
        $notifications = $this->db->query("SELECT u.username,u.photo from user_friend_request_notifications ufrn INNER JOIN users u ON ufrn.from_user=u.id WHERE to_user=:id AND ufrn.status='PENDING' ORDER BY ufrn.created_at")->getAll([":id" => $id]);
        if (empty($notifications)) {
            return sendResponse(false, "no notifications!!");
        }
        return sendResponse(true, "notifications fetched!!", $notifications);
    }

    public function acceptRequest($token, $username)
    {
        $toUser = $this->getUserIdByToken($token);
        $toUserId = $toUser['user_id'];
        $fromUser = $this->db->query("SELECT id FROM users WHERE username=:username")->get([":username" => $username]);
        $fromUserId = $fromUser['id'];
        $this->db->query("UPDATE user_friend_request_notifications SET status = 'ACCEPTED' WHERE from_user=:from_id AND to_user=:to_id")->execute([":from_id" => $fromUserId, ":to_id" => $toUserId]);
        $this->db->query("INSERT INTO user_contacts (user_id,friend_id) VALUES (:from_id,:to_id),(:to_id,:from_id)")->execute([":from_id" => $fromUserId, ":to_id" => $toUserId]);
        return sendResponse(true, "friend request accepted");
    }

    public function rejectRequest($token, $username)
    {
        $toUser = $this->getUserIdByToken($token);
        $toUserId = $toUser['user_id'];
        $fromUser = $this->db->query("SELECT id FROM users WHERE username=:username")->get([":username" => $username]);
        $fromUserId = $fromUser['id'];
        $this->db->query("UPDATE user_friend_request_notifications SET status = 'REJECTED' WHERE from_user=:from_id AND to_user=:to_id")->execute([":from_id" => $fromUserId, ":to_id" => $toUserId]);
        return sendResponse(true, "friend request rejected!!");
    }

    public function getChatContent($token, $username)
    {
        $toUser = $this->getUserIdByToken($token);
        $toUserId = $toUser['user_id'];
        $fromUser = $this->db->query("SELECT id,photo,is_online FROM users WHERE username=:username")->get([":username" => $username]);
        $fromUserId = $fromUser['id'];
        $data = [];
        $data['username'] = $username;
        $data['photo'] = $fromUser['photo'];
        $data['is_online'] = $fromUser['is_online'];

        return sendResponse(true, "contact chat fetched!", $data);
    }

    public function sendMessage($token, $username, $textMessage, $is_media)
    {
        $msgFrom = $this->getUserIdByToken($token);
        $msgFromUserId = $msgFrom['user_id'];
        $msgTo = $this->db->query("SELECT id,photo,is_online FROM users WHERE username=:username")->get([":username" => $username]);
        $msgToUserId = $msgTo['id'];
        $is_media = (bool) $is_media;        
        $this->db->query("INSERT INTO messages (message_from,message_to,message_content,is_media) VALUES (:msg_from,:msg_to,:msg,:is_media)")->execute([":msg_from" => $msgFromUserId, ":msg_to" => $msgToUserId, ":msg" => $textMessage, ":is_media" => $is_media ? 'true' : 'false']);
        return sendResponse(true, "message sent!!");
    }

    public function fetchMessages($token, $username)
    {
        $msgFrom = $this->getUserIdByToken($token);
        $msgFromUserId = $msgFrom['user_id'];
        $msgTo = $this->db->query("SELECT id,photo,is_online FROM users WHERE username=:username")->get([":username" => $username]);
        $msgToUserId = $msgTo['id'];
        $this->db->query("UPDATE messages SET status=TRUE WHERE message_from=:message_from AND message_to=:message_to")->execute([":message_from" => $msgToUserId, ":message_to" => $msgFromUserId]);
        $messages = $this->db->query("SELECT message_content,send_at,status,is_media,(message_from = :message_from) AS is_mine FROM messages WHERE ((message_from=:message_from AND message_to=:message_to) OR (message_from=:message_to AND message_to=:message_from)) AND deleted = false ORDER BY send_at")->getAll([":message_from" => $msgFromUserId, ":message_to" => $msgToUserId]);
        return sendResponse(true, "messages fetched!!", $messages);
    }

    public function deleteChat($token, $username)
    {
        $msgFrom = $this->getUserIdByToken($token);
        $msgFromUserId = $msgFrom['user_id'];
        $msgTo = $this->db->query("SELECT id,photo,is_online FROM users WHERE username=:username")->get([":username" => $username]);
        $msgToUserId = $msgTo['id'];
        $this->db->query("UPDATE messages SET deleted=true WHERE ((message_from=:message_from AND message_to=:message_to) OR (message_from=:message_to AND message_to=:message_from)) AND deleted = false")->execute([":message_from" => $msgFromUserId, ":message_to" => $msgToUserId]);
        return sendResponse(true, "chat deleted successfully!!");
    }

    public function deleteContact($token, $username)
    {
        $msgFrom = $this->getUserIdByToken($token);
        $currentUser = $msgFrom['user_id'];
        $msgTo = $this->db->query("SELECT id,photo,is_online FROM users WHERE username=:username")->get([":username" => $username]);
        $friendId = $msgTo['id'];
        $this->deleteChat($token, $username);
        $this->db->query("UPDATE user_contacts SET status=FALSE WHERE ((user_id=:current_user AND friend_id=:friend_id) OR (user_id=:friend_id AND friend_id=:current_user)) AND status=TRUE")->execute([":friend_id" => $friendId, ":current_user" => $currentUser]);
        return sendResponse(true, "contact deleted!!");
    }
}
