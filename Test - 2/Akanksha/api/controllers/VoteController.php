<?php

session_start();

require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";

class VoteController
{
    private $db = null;

    function __construct()
    {
        $this->db = new DB();
    }

    public function vote($poll_id, $option_id)
    {
        if (!isset($_SESSION['user'])) {
            sendResponse(false, "Login required");
        }

        $user_id = $_SESSION['user']['id'];

        if (!$poll_id || !$option_id) {
            sendResponse(false, "Invalid request");
        }

        $this->db->query("
            SELECT status 
            FROM polls 
            WHERE id = :poll_id
        ");

        $poll = $this->db->first([
            ':poll_id' => $poll_id
        ]);

        if (!$poll) {
            sendResponse(false, "Poll not found");
        }

        if ($poll['status'] !==  true) {
            sendResponse(false, "Poll is closed");
        }

        $this->db->query("
            SELECT id 
            FROM votes 
            WHERE user_id = :user_id 
            AND poll_id = :poll_id
        ");

        $already = $this->db->first([
            ':user_id' => $user_id,
            ':poll_id' => $poll_id
        ]);

        if ($already) {
            sendResponse(false, "You already voted");
        }

        $this->db->query("
            INSERT INTO votes (user_id, poll_id, option_id)
            VALUES (:user_id, :poll_id, :option_id)
        ");

        $vote = $this->db->create([
            ':user_id' => $user_id,
            ':poll_id' => $poll_id,
            ':option_id' => $option_id
        ]);

        if (!$vote) {
            sendResponse(false, "Vote failed");
        }

        sendResponse(true, "Vote submitted successfully");
    }
}
