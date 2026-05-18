<?php

require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";

class PollController
{
    private $db = null;

    function __construct()
    {
        $this->db = new DB();
    }

    public function createPoll(
        $question,
        $start_time,
        $end_time,
        $options
    ) {

        if (
            empty($question) ||
            empty($start_time) ||
            empty($end_time)
        ) {

            sendResponse(
                false,
                "All fields required"
            );
        }

        if (count($options) < 2) {

            sendResponse(
                false,
                "Minimum 2 options required"
            );
        }

        if (
            strtotime($end_time)
            <= strtotime($start_time)
        ) {

            sendResponse(
                false,
                "End time must be greater than start time"
            );
        }

        $query = "
            INSERT INTO polls
            (
                question,
                start_time,
                end_time
            )
            VALUES
            (
                :question,
                :start_time,
                :end_time
            )
        ";

        $this->db->query($query);

        $create =
            $this->db->create([

                ':question' => $question,

                ':start_time' => $start_time,

                ':end_time' => $end_time

            ]);

        if (!$create) {

            sendResponse(
                false,
                "Poll creation failed"
            );
        }


        $pollQuery = "
            SELECT *
            FROM polls
            ORDER BY id DESC
            LIMIT 1
        ";

        $this->db->query($pollQuery);

        $poll =
            $this->db->first();


        foreach ($options as $option) {

            $option = trim($option);

            if ($option === "") {
                continue;
            }

            $optionQuery = "
                INSERT INTO poll_options
                (
                    poll_id,
                    option_text
                )
                VALUES
                (
                    :poll_id,
                    :option_text
                )
            ";

            $this->db->query($optionQuery);

            $this->db->create([

                ':poll_id' =>
                $poll['id'],

                ':option_text' =>
                $option

            ]);
        }

        sendResponse(
            true,
            "Poll created successfully"
        );
    }



    public function getPolls()
    {
        $query = "
            SELECT *
            FROM polls
            WHERE status = true
            ORDER BY id DESC
        ";

        $this->db->query($query);

        $polls =
            $this->db->get();

        foreach ($polls as &$poll) {

            $current =
                date('Y-m-d H:i:s');

            if (
                $current < $poll['start_time']
            ) {

                $poll['poll_status'] =
                    "upcoming";
            } elseif (
                $current > $poll['end_time']
            ) {

                $poll['poll_status'] =
                    "closed";
            } else {

                $poll['poll_status'] =
                    "open";
            }
        }

        sendResponse(
            true,
            "Polls fetched",
            $polls
        );
    }


    public function deletePoll($poll_id)
    {
        if (empty($poll_id)) {

            sendResponse(
                false,
                "Poll id required"
            );
        }

        $checkQuery = "
            SELECT *
            FROM polls
            WHERE id = :id
        ";

        $this->db->query($checkQuery);

        $poll =
            $this->db->first([

                ':id' => $poll_id

            ]);

        if (empty($poll)) {

            sendResponse(
                false,
                "Poll not found"
            );
        }

        $query = "
            UPDATE polls
            SET
                status = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ";

        $this->db->query($query);

        $delete =
            $this->db->update([

                ':id' => $poll_id

            ]);

        if (!$delete) {

            sendResponse(
                false,
                "Delete failed"
            );
        }

        sendResponse(
            true,
            "Poll deleted successfully"
        );
    }
    public function getPublicPolls()
    {


        session_start();

        $user_id = $_SESSION['user']['id'] ?? null;
        $query = "
        SELECT *
        FROM polls
        WHERE status = true
        ORDER BY id DESC
    ";

        $this->db->query($query);
        $polls = $this->db->get();

        date_default_timezone_set('Asia/Kolkata');

        foreach ($polls as &$poll) {

            $current = time();
            $start = strtotime($poll['start_time']);
            $end = strtotime($poll['end_time']);

            if ($current >= $start && $current <= $end) {
                $poll['poll_status'] = "open";
            } elseif ($current < $start) {
                $poll['poll_status'] = "upcoming";
            } else {
                $poll['poll_status'] = "closed";
            }

            $this->db->query("
            SELECT COUNT(*) as total_votes
            FROM votes
            WHERE poll_id = :poll_id
        ");

            $total = $this->db->first([
                ':poll_id' => $poll['id']
            ]);

            $totalVotes = $total['total_votes'] ?? 0;
            $poll['total_votes'] = $totalVotes;

            $this->db->query("
            SELECT 
                po.id,
                po.option_text,
                COUNT(v.id) as votes
            FROM poll_options po
            LEFT JOIN votes v 
                ON po.id = v.option_id
            WHERE po.poll_id = :poll_id
            GROUP BY po.id , po.option_text
        ");

            $options = $this->db->get([
                ':poll_id' => $poll['id']
            ]);

            $userSelected = null;

            if ($user_id) {

                $this->db->query("
        SELECT option_id
        FROM votes
        WHERE poll_id = :poll_id
        AND user_id = :user_id
        LIMIT 1
    ");

                $res = $this->db->first([
                    ':poll_id' => $poll['id'],
                    ':user_id' => $user_id
                ]);

                $userSelected = $res['option_id'] ?? null;
            }

            $poll['user_selected_option'] = $userSelected;

            foreach ($options as &$opt) {

                $opt['votes'] = $opt['votes'] ?? 0;

                if ($totalVotes > 0) {
                    $opt['percentage'] =
                        round(($opt['votes'] / $totalVotes) * 100);
                } else {
                    $opt['percentage'] = 0;
                }
            }

            $poll['options'] = $options;
        }

        sendResponse(true, "Polls fetched", $polls);
    }

    public function getAdminStats()
    {
        date_default_timezone_set('Asia/Kolkata');
        $current = time();

        $this->db->query("
        SELECT COUNT(*) as total 
        FROM polls 
        WHERE status = true
    ");
        $total = $this->db->first();

        $this->db->query("
        SELECT id, start_time, end_time 
        FROM polls 
        WHERE status = true
    ");
        $polls = $this->db->get();

        $active = 0;
        $closed = 0;
        $upcoming = 0;

        foreach ($polls as $poll) {

            $start = strtotime($poll['start_time']);
            $end = strtotime($poll['end_time']);

            if ($current >= $start && $current <= $end) {
                $active++;
            } elseif ($current < $start) {
                $upcoming++;
            } else {
                $closed++;
            }
        }


        $this->db->query("
        SELECT COUNT(*) as votes 
        FROM votes
    ");
        $votes = $this->db->first();

        sendResponse(true, "Stats fetched", [
            "total_polls" => $total['total'] ?? 0,
            "active_polls" => $active,
            "closed_polls" => $closed,
            "upcoming_polls" => $upcoming,
            "total_votes" => $votes['votes'] ?? 0
        ]);
    }
}
