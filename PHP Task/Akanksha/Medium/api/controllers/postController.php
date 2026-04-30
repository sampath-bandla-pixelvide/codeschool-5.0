<?php

require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";
require_once __DIR__ . "/../utils/auth.php";

class PostController {

    private $db;

    public function __construct() {
        $this->db = new DB();
    }

    public function createPost($title, $content) {

        $user_id = requireAuth();

        if (!$title || !$content) {
            sendResponse(false, "All fields required");
        }

        $this->db->query("
            INSERT INTO posts (user_id, title, content)
            VALUES (:user_id, :title, :content)
        ");

        $created = $this->db->create([
            'user_id' => $user_id,
            'title'   => $title,
            'content' => $content
        ]);

        if (!$created) {
            sendResponse(false, "Failed to create post");
        }

        sendResponse(true, "Post created successfully");
    }

    public function getPosts() {

        $user_id = requireAuth();

        $this->db->query("
            SELECT * FROM posts 
            WHERE user_id = :user_id 
            ORDER BY id DESC
        ");

        $posts = $this->db->get([
            'user_id' => $user_id
        ]);

        sendResponse(true, "Posts fetched", $posts);
    }


    public function getPost($id) {

    $user_id = requireAuth();

    $this->db->query("
        SELECT * FROM posts 
        WHERE id = :id AND user_id = :user_id
    ");

    $post = $this->db->first([
        'id' => $id,
        'user_id' => $user_id
    ]);

    if (!$post) {
        sendResponse(false, "Post not found");
    }

    sendResponse(true, "Post fetched", $post);
    }

    public function getAllPosts() {

    $this->db->query("
         SELECT 
            posts.*, 
            users.name,
            COUNT(DISTINCT comments.id) AS comment_count,
            COUNT(DISTINCT claps.id) AS clap_count
        FROM posts
        JOIN users ON posts.user_id = users.id
        LEFT JOIN comments ON posts.id = comments.post_id
        LEFT JOIN claps ON posts.id = claps.post_id
        GROUP BY posts.id, users.name
        ORDER BY posts.id DESC
    ");

    $posts = $this->db->get();

    sendResponse(true, "All posts fetched", $posts);
    }

    public function readPost() {

    }

    public function updatePost($id, $title, $content) {

    $user_id = requireAuth();

    if (!$id || !$title || !$content) {
        sendResponse(false, "All fields required");
    }

 
    $this->db->query("
        SELECT id FROM posts 
        WHERE id = :id AND user_id = :user_id
    ");

    $post = $this->db->first([
        'id' => $id,
        'user_id' => $user_id
    ]);

    if (!$post) {
        sendResponse(false, "Unauthorized or post not found");
    }

 
    $this->db->query("
        UPDATE posts 
        SET title = :title, content = :content 
        WHERE id = :id AND user_id = :user_id
    ");

    $updated = $this->db->update([
        'id' => $id,
        'user_id' => $user_id,
        'title' => $title,
        'content' => $content
    ]);

    if (!$updated) {
        sendResponse(false, "Failed to update post");
    }

    sendResponse(true, "Post updated successfully");
    }

    public function deletePost($id) {

    $user_id = requireAuth();

    if (!$id) {
        sendResponse(false, "Post ID required");
    }

    
    $this->db->query("
        SELECT id FROM posts 
        WHERE id = :id AND user_id = :user_id
    ");

    $post = $this->db->first([
        'id' => $id,
        'user_id' => $user_id
    ]);

    if (!$post) {
        sendResponse(false, "Unauthorized or post not found");
    }

    $this->db->query("
        DELETE FROM posts 
        WHERE id = :id AND user_id = :user_id
    ");

    $deleted = $this->db->delete([
        'id' => $id,
        'user_id' => $user_id
    ]);

    if (!$deleted) {
        sendResponse(false, "Failed to delete post");
    }

    sendResponse(true, "Post deleted successfully");
    }

    public function getPostById($id) {

    if (!$id) {
        sendResponse(false, "Post ID required");
    }

    $current_user = requireAuth();

    $this->db->query("
       SELECT 
            posts.*, 
            users.name,

            EXISTS (
                SELECT 1 FROM follows
                WHERE follower_id = :current_user
                AND following_id = users.id
            ) AS is_following

        FROM posts
        JOIN users ON posts.user_id = users.id
        WHERE posts.id = :id
    ");

    $post = $this->db->first([
        'id' => $id , 
        'current_user' => $current_user
    ]);

    if (!$post) {
        sendResponse(false, "Post not found");
    }

    sendResponse(true, "Post fetched", $post);
    }

    public function getProfile() {

    $user_id = requireAuth();

    $this->db->query("
        SELECT id, name, email 
        FROM users
        WHERE id = :id
    ");

    $user = $this->db->first([
        'id' => $user_id
    ]);

    if (!$user) {
        sendResponse(false, "User not found");
    }

    sendResponse(true, "Profile fetched", $user);
    }

    public function addClap($user_id, $post_id){

  
    $this->db->query("
        INSERT INTO claps (user_id, post_id)
        VALUES (:user_id, :post_id)
        ON CONFLICT (user_id, post_id) DO NOTHING
    ");

    $this->db->create([
        ':user_id' => $user_id,
        ':post_id' => $post_id
    ]);

        $this->db->query("
        SELECT COUNT(*) AS count
        FROM claps
        WHERE post_id = :post_id
    ");

    $result = $this->db->first([
        ':post_id' => $post_id
    ]);

    sendResponse(true, "Clap updated", [
        "count" => (int)$result['count']
    ]);
    }
}