<?php

require_once(__DIR__ . '/../config/db.php');

class AttemptController
{

    private $db;
    public function __construct()
    {
        $this->db = new DB();
    }
    public function submitAttempt($userId, $quizId, $answers)
    {
        if (!$quizId) {
            return ["status" => false, "message" => "Invalid data"];
        }

        // get questions + correct options
        $questions = $this->db->query("
        SELECT q.id as question_id, o.id as correct_option_id
        FROM questions q
        JOIN options o ON o.question_id = q.id AND o.is_correct = true
        WHERE q.quiz_id = :qid AND q.status = true
        ")->get(['qid' => $quizId]);

        $correctMap = [];
        foreach ($questions as $q) {
            $correctMap[$q['question_id']] = $q['correct_option_id'];
        }

        $score = 0;
        $total = count($correctMap);

        // compare answers
        foreach ($answers as $qid => $selectedOptionId) {
            if (isset($correctMap[$qid]) && $correctMap[$qid] == $selectedOptionId) {
                $score++;
            }
        }

        // insert attempt
        $this->db->run("
        INSERT INTO attempts (user_id, quiz_id, obtained_marks, total_marks, submitted_at)
        VALUES (:uid, :qid, :score, :total, NOW())
    ", [
            'uid' => $userId,
            'qid' => $quizId,
            'score' => $score,
            'total' => $total
        ]);

        return [
            "status" => true,
            "data" => [
                "score" => $score,
                "total" => $total
            ]
        ];
    }


    //USER DASHBOARD ATTEMPTS
    public function getUserAttempts($userId)
    {
        $this->db->query("
            SELECT a.id, q.title, a.obtained_marks, a.total_marks, a.submitted_at
            FROM attempts a
            JOIN quizzes q ON q.id = a.quiz_id
            WHERE a.user_id = :uid
              AND a.submitted_at IS NOT NULL
            ORDER BY a.submitted_at DESC
        ");

        $data = $this->db->get(['uid' => $userId]);

        return [
            "status" => true,
            "data" => $data
        ];
    }

    //admin
    public function getDashboardStats()
    {
        $users = $this->db->query("SELECT COUNT(*) as cnt FROM users WHERE status = true")->first();
        $quizzes = $this->db->query("SELECT COUNT(*) as cnt FROM quizzes WHERE status = true")->first();
        $attempts = $this->db->query("SELECT COUNT(*) as cnt FROM attempts")->first();

        return [
            "status" => true,
            "data" => [
                "total_users" => $users['cnt'],
                "total_quizzes" => $quizzes['cnt'],
                "total_attempts" => $attempts['cnt']
            ]
        ];
    }
    public function getAllUserAttempts()
    {
        $this->db->query("
            SELECT 
          a.id,
          u.name AS user_name,
          q.title AS quiz_title,
          a.obtained_marks,
          a.total_marks,
          a.submitted_at
        FROM attempts a
        JOIN users u ON u.id = a.user_id
        JOIN quizzes q ON q.id = a.quiz_id
        ORDER BY a.submitted_at DESC
        ");

        $data = $this->db->get();

        return [
            "status" => true,
            "data" => $data
        ];
    }
}
