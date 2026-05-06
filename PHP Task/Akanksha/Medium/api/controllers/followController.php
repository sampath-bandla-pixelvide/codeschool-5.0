<?php

require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";
require_once __DIR__ . "/../utils/auth.php";

class FollowController {

    private $db;

    public function __construct() {
        $this->db = new DB();
    }

 
    public function toggleFollow($following_id) {

        $follower_id = requireAuth();

        if (!$following_id) {
            sendResponse(false, "User ID required");
        }

        if ($follower_id == $following_id) {
            sendResponse(false, "You cannot follow yourself");
        }

        $this->db->query("
            SELECT 1 FROM follows 
            WHERE follower_id = :follower_id 
            AND following_id = :following_id
        ");

        $exists = $this->db->first([
            'follower_id' => $follower_id,
            'following_id' => $following_id
        ]);

        if ($exists) {
           
            $this->db->query("
                DELETE FROM follows 
                WHERE follower_id = :follower_id 
                AND following_id = :following_id
            ");

            $deleted = $this->db->delete([
                'follower_id' => $follower_id,
                'following_id' => $following_id
            ]);

            if (!$deleted) {
                sendResponse(false, "Unfollow failed");
            }

            sendResponse(true, "Unfollowed", [
                "action" => "removed"
            ]);

        } else {
            
            $this->db->query("
                INSERT INTO follows (follower_id, following_id)
                VALUES (:follower_id, :following_id)
            ");

            $created = $this->db->create([
                'follower_id' => $follower_id,
                'following_id' => $following_id
            ]);

            if (!$created) {
                sendResponse(false, "Follow failed");
            }

            sendResponse(true, "Followed", [
                "action" => "added"
            ]);
        }
    }


    public function getFollowing() {

        $user_id = requireAuth();

        $this->db->query("
            SELECT users.id, users.name
            FROM follows
            JOIN users ON follows.following_id = users.id
            WHERE follows.follower_id = :user_id
        ");

        $data = $this->db->get([
            'user_id' => $user_id
        ]);

        sendResponse(true, "Following list", $data);
    }


    
    public function getFollowers() {

        $user_id = requireAuth();

        $this->db->query("
            SELECT users.id, users.name
            FROM follows
            JOIN users ON follows.follower_id = users.id
            WHERE follows.following_id = :user_id
        ");

        $data = $this->db->get([
            'user_id' => $user_id
        ]);

        sendResponse(true, "Followers list", $data);
    }


    
    // public function getFeed() {

    //     $user_id = requireAuth();

    //     $this->db->query("
    //         SELECT posts.*, users.name
    //         FROM posts
    //         JOIN users ON posts.user_id = users.id
    //         WHERE posts.user_id IN (
    //             SELECT following_id 
    //             FROM follows 
    //             WHERE follower_id = :user_id
    //         )
    //         ORDER BY posts.created_at DESC
    //     ");

    //     $data = $this->db->get([
    //         'user_id' => $user_id
    //     ]);

    //     sendResponse(true, "Feed fetched", $data);
    // }
}