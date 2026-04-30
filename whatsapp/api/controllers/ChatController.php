<?php
require_once(__DIR__ . "/../config/db.php");

class ChatController
{
    private $db;

    public function __construct()
    {
        $this->db = new DB();
    }

    public function getUsers($myId)
    {
        $this->db->query("
        SELECT id, username, profile_picture
        FROM users
        WHERE id != :me
        ORDER BY username ASC
    ");

        return $this->db->get(['me' => $myId]);
    }
    public function createOrGetConversation($me, $other)
    {
        if ($me == $other) {
            return ["error" => "Cannot chat with yourself"];
        }

        // check if conversation already exists
        $this->db->query("
        SELECT c.id
        FROM conversations c
        JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
        JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
        WHERE cp1.user_id = :me
        AND cp2.user_id = :other
        LIMIT 1
    ");

        $existing = $this->db->first([
            'me' => $me,
            'other' => $other
        ]);

        // If exists → return it
        if ($existing) {
            return [
                "conversation_id" => $existing['id'],
                "is_new" => false
            ];
        }

        // Create new conversation
        $this->db->query("
        INSERT INTO conversations (created_by)
        VALUES (:me)
        RETURNING id
    ");

        $conv = $this->db->first(['me' => $me]);
        $cid = $conv['id'];

        //  Insert participants (BOTH USERS)
        $this->db->run("
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (:cid, :me), (:cid, :other)
    ", [
            'cid'   => $cid,
            'me'    => $me,
            'other' => $other
        ]);

        // Return new conversation
        return [
            "conversation_id" => $cid,
            "is_new" => true
        ];
    }

    public function getConversations($user_id,$search)
    {
        $query = "
    SELECT 
        c.id AS conversation_id,
        u.id AS user_id,
        u.username,
        u.profile_picture,

        m.content AS last_message,
        m.created_at AS last_time,

        CASE 
            WHEN m.sender_id = :my_id THEN true 
            ELSE false 
        END AS is_last_mine,

        COALESCE(
        CASE 
            WHEN m.sender_id = :my_id THEN ms_other.status
            ELSE ms_me.status
        END,
    'sent') AS last_status,
    (
  SELECT COUNT(*)
  FROM messages m2
  JOIN message_status ms2 
    ON ms2.message_id = m2.id
  WHERE m2.conversation_id = c.id
    AND ms2.user_id = :my_id
    AND ms2.status != 'read'
) AS unread_count

    FROM conversation_participants cp1

    JOIN conversation_participants cp2 
        ON cp1.conversation_id = cp2.conversation_id

    JOIN users u 
        ON u.id = cp2.user_id

    JOIN conversations c 
        ON c.id = cp1.conversation_id
    LEFT JOIN messages m 
        ON m.id = (
            SELECT id 
            FROM messages 
            WHERE conversation_id = c.id
            ORDER BY created_at DESC
            LIMIT 1
        )

    --  my status (for received messages)
    LEFT JOIN message_status ms_me
    ON ms_me.message_id = m.id
    AND ms_me.user_id = :my_id

--  other user's status (for my messages)
    LEFT JOIN message_status ms_other
    ON ms_other.message_id = m.id
    AND ms_other.user_id != :my_id

    WHERE cp1.user_id = :my_id
      AND cp2.user_id != :my_id
      and (
      :search='' or lower(u.username) like lower(:search_term)
      )

    ORDER BY c.updated_at DESC
    ";

        return $this->db->query($query)->get([
            'my_id' => $user_id,
            'search'=>$search,
            'search_term' => '%'.$search.'%'
        ]);
    }
    public function getMessages($conversationId, $myId)
    {
        // mark msgs as read
        $this->db->run("
        UPDATE message_status ms
        SET status = 'read', read_at = NOW()
        FROM messages m
        WHERE ms.message_id = m.id
          AND m.conversation_id = :cid
          AND ms.user_id = :me
          AND ms.status != 'read'  
    ", [
            'cid' => $conversationId,
            'me'  => $myId
        ]);

        $this->db->query("
    SELECT 
        m.id,
        m.content,
        m.created_at,
        m.file_path,
        m.message_type,
        m.deleted_for_everyone,
        -- COALESCE(ms_other.deleted, ms_me.deleted, false)
          ms_me.deleted AS deleted_for_me,

        CASE 
            WHEN m.sender_id = :me THEN true 
            ELSE false 
        END AS is_mine,

        COALESCE(
            CASE 
                WHEN m.sender_id = :me THEN ms_other.status
                ELSE ms_me.status
            END,
        'sent') AS status

    FROM messages m

    --  my status (for received messages)
    LEFT JOIN message_status ms_me
        ON ms_me.message_id = m.id
        AND ms_me.user_id = :me

    --  other user's status (for sent messages)
    LEFT JOIN message_status ms_other
        ON ms_other.message_id = m.id
        AND ms_other.user_id != :me

    WHERE m.conversation_id = :cid -- AND COALESCE(ms_other.deleted, ms_me.deleted, false) = true
    ORDER BY m.created_at ASC
");

        return $this->db->get([
            'cid' => $conversationId,
            'me'  => $myId
        ]);
    }
    // public function sendMessage($conversationId, $senderId, $content)
    // {
    //     $this->db->query("
    //     INSERT INTO messages (conversation_id, sender_id, content)
    //     VALUES (:cid, :sid, :content)
    //     RETURNING id, content, created_at
    // ");

    //     $msg = $this->db->first([
    //         'cid'     => $conversationId,
    //         'sid'     => $senderId,
    //         'content' => $content
    //     ]);

    //     $messageId = $msg['id'];

    //     // 2.  get receiver (other user)
    //     $this->db->query("
    //     SELECT user_id 
    //     FROM conversation_participants
    //     WHERE conversation_id = :cid
    //       AND user_id != :me
    //     LIMIT 1
    // ");

    //     $receiver = $this->db->first([
    //         'cid' => $conversationId,
    //         'me'  => $senderId
    //     ]);

    //     // INSERT STATUS FOR RECEIVER
    //     if ($receiver) {
    //         $this->db->run("
    //         INSERT INTO message_status (message_id, user_id, status)
    //         VALUES (:mid, :uid, 'sent')
    //     ", [
    //             'mid' => $messageId,
    //             'uid' => $receiver['user_id']
    //         ]);
    //     }

    //     // 4. update conversation time
    //     $this->db->run("
    //     UPDATE conversations 
    //     SET updated_at = NOW() 
    //     WHERE id = :cid
    // ", ['cid' => $conversationId]);

    //     // 5. send response
    //     $msg['is_mine'] = true;
    //     $msg['status'] = 'sent';
    //     $msg['user_id']=$senderId; // to loadconversations

    //     return $msg;
    // }
    public function sendMessage($conversationId, $senderId, $content, $type = 'text', $file = null)
    {
        $filePath = null;

        if ($type === 'media') {

            if ($file && !empty($file['name'])) {

                $filename = time() . "_" . basename($file['name']);
                $uploadDir = __DIR__ . "/../../uploads/messages/";

                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                $target = $uploadDir . $filename;

                if (move_uploaded_file($file['tmp_name'], $target)) {
                    $filePath = "/uploads/messages/" . $filename;
                    $content = null; // no text
                } else {
                    return ["error" => "File upload failed"];
                }
            } else {
                return ["error" => "No file provided"];
            }
        }

      
        $this->db->query("
        INSERT INTO messages (conversation_id, sender_id, content, file_path, message_type)
        VALUES (:cid, :sid, :content, :file, :type)
        RETURNING id, content, file_path, message_type, created_at
    ");

        $msg = $this->db->first([
            'cid'     => $conversationId,
            'sid'     => $senderId,
            'content' => $content,
            'file'    => $filePath,
            'type'    => $type
        ]);

        $messageId = $msg['id'];

       //get receiver
        $this->db->query("
        SELECT user_id 
        FROM conversation_participants
        WHERE conversation_id = :cid
          AND user_id != :me
        LIMIT 1
    ");

        $receiver = $this->db->first([
            'cid' => $conversationId,
            'me'  => $senderId
        ]);

        //  INSERT STATUS
        if ($receiver) {
            $this->db->run("
            INSERT INTO message_status (message_id, user_id, status)
            VALUES (:mid, :uid, 'sent')
        ", [
                'mid' => $messageId,
                'uid' => $receiver['user_id']
            ]);
        }

        //  UPDATE CONVERSATION
        $this->db->run("
        UPDATE conversations 
        SET updated_at = NOW() 
        WHERE id = :cid
    ", ['cid' => $conversationId]);

        //  RESPONSE FORMAT
        $msg['is_mine'] = true;
        $msg['status'] = 'sent';
        $msg['user_id'] = $senderId;

        return $msg;
    }
    public function last_seen($conversationId, $myId)
    {
        $this->db->query("
        SELECT 
            u.id,
            u.username,
            u.profile_picture,
            u.is_online,
            u.last_seen
        FROM conversation_participants cp1
        JOIN conversation_participants cp2 
            ON cp1.conversation_id = cp2.conversation_id
        JOIN users u 
            ON u.id = cp2.user_id
        WHERE cp1.conversation_id = :cid
          AND cp1.user_id = :me
          AND cp2.user_id != :me
        LIMIT 1
        ");

        return $this->db->first([
            'cid' => $conversationId,
            'me'  => $myId
        ]);
    }
    public function deleteMessage($messageId,$userId,$type){
        $this->db->query("select sender_id from messages where id=:id");
        $msg=$this->db->first(['id'=>$messageId]);
        if(!$msg) sendResponse(false,"msg not found");
        // if($type==='me'){
        //     $this->db->run("
        //     update message_status set deleted=true 
        //     where message_id=:mid 
        //     ",[
        //         'mid'=>$messageId,
        //         'uid'=>$userId
        //     ]);
        //     // $this->db->query("
        //     // select * from message_status
        //     // where message_id=:mid and user_id=:uid
        //     // ",[
        //     //     'mid'=>$messageId,
        //     //     'uid'=>$userId
        //     // ]);
        //     // sendResponse(true,"123");
        //     return ;
        // }
        if($type==='everyone'){
            if($msg['sender_id']!=$userId) sendResponse(false,"not allowed");
            $this->db->run("
            update messages set deleted_for_everyone=true 
            where id=:mid 
            ",[
                'mid'=>$messageId 
            ]);
            return;
            
        }
        return sendResponse(false,"invalid type");

    }
}
