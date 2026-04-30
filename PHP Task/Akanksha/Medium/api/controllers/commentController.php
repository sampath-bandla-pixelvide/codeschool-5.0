<?php

require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";
require_once __DIR__ . "/../utils/auth.php";

class CommentController {

    private $db;

    public function __construct() {
        $this->db = new DB();
    }

 
    public function addComment($post_id, $comment) {

        $user_id = requireAuth();

        if (!$post_id || !$comment) {
            sendResponse(false, "All fields required");
        }

        $this->db->query("
            INSERT INTO comments (user_id, post_id, comment)
            VALUES (:user_id, :post_id, :comment)
        ");

        $created = $this->db->create([
            'user_id' => $user_id,
            'post_id' => $post_id,
            'comment' => $comment
        ]);

        if (!$created) {
            sendResponse(false, "Failed to add comment");
        }

        sendResponse(true, "Comment added");
    }


    public function getComments($post_id) {

        if (!$post_id) {
            sendResponse(false, "Post ID required");
        }

        $this->db->query("
            SELECT comments.*, users.name
            FROM comments
            JOIN users ON comments.user_id = users.id
            WHERE comments.post_id = :post_id
            ORDER BY comments.id DESC
        ");

        $comments = $this->db->get([
            'post_id' => $post_id
        ]);

        sendResponse(true, "Comments fetched", $comments);
    }



    public function deleteComment($id) {

        $user_id = requireAuth();

        $this->db->query("
            SELECT * FROM comments
            WHERE id = :id AND user_id = :user_id
        ");

        $comment = $this->db->single([
            'id' => $id,
            'user_id' => $user_id
        ]);

        if (!$comment) {
            sendResponse(false, "Unauthorized or not found");
        }

        $this->db->query("DELETE FROM comments WHERE id = :id");

        $deleted = $this->db->delete([
            'id' => $id
        ]);

        if (!$deleted) {
            sendResponse(false, "Delete failed");
        }

        sendResponse(true, "Comment deleted");
    }
}