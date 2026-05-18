<?php

require_once(__DIR__ . "/../utils/db.php");
require_once(__DIR__ . "/../utils/functions.php");

class QuizControllers
{
    private $db;

    public function __construct()
    {
        $this->db = new DB();
    }
    // get subject functions
    public function getSubjects()
    {
        $subjects = $this->db
            ->query("
                SELECT *
                FROM subjects
                ORDER BY id ASC
            ")
            ->get();

        sendResponse(true, "Subjects fetched successfully", $subjects);
    }
    // get the subject questions 
    public function getSubjectQuestions($subject_id)
    {
        if ($subject_id == "") {
            sendResponse(false, "Subject id is required");
        }

        $questions = $this->db
            ->query("
                SELECT 
                    q.id,
                    q.question,
                    q.option_a,
                    q.option_b,
                    q.option_c,
                    q.option_d,
                    s.subject_name
                FROM questions q
                JOIN subjects s ON s.id = q.subject_id
                WHERE q.subject_id = :subject_id
                ORDER BY q.id ASC
            ")
            ->get([
                "subject_id" => $subject_id
            ]);

        sendResponse(true, "Questions fetched successfully", $questions);
    }

    // add the questions

    public function addQuestion($subject_id, $question, $option_a, $option_b, $option_c, $option_d, $correct_answer)
    {
        $subject_id = trim($subject_id);
        $question = trim($question);
        $option_a = trim($option_a);
        $option_b = trim($option_b);
        $option_c = trim($option_c);
        $option_d = trim($option_d);
        $correct_answer = strtoupper(trim($correct_answer));

        if ($subject_id == "") {
            sendResponse(false, "Subject is required");
        }

        if ($question == "") {
            sendResponse(false, "Question is required");
        }

        if ($option_a == "") {
            sendResponse(false, "Option A is required");
        }

        if ($option_b == "") {
            sendResponse(false, "Option B is required");
        }

        if ($option_c == "") {
            sendResponse(false, "Option C is required");
        }

        if ($option_d == "") {
            sendResponse(false, "Option D is required");
        }

        if ($correct_answer == "") {
            sendResponse(false, "Correct answer is required");
        }

        if (!in_array($correct_answer, ["A", "B", "C", "D"])) {
            sendResponse(false, "Invalid correct answer");
        }

        $this->db
            ->query("
            INSERT INTO questions
            (subject_id, question, option_a, option_b, option_c, option_d, correct_answer)
            VALUES
            (:subject_id, :question, :option_a, :option_b, :option_c, :option_d, :correct_answer)
        ")
            ->create([
                "subject_id" => $subject_id,
                "question" => $question,
                "option_a" => $option_a,
                "option_b" => $option_b,
                "option_c" => $option_c,
                "option_d" => $option_d,
                "correct_answer" => $correct_answer
            ]);

        sendResponse(true, "Question added successfully");
    }

    // get questions(view)
    public function getQuestions()
    {
        $questions = $this->db
            ->query("
            SELECT
                q.id,
                q.question,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_answer,
                s.subject_name
            FROM questions q
            JOIN subjects s ON s.id = q.subject_id
            ORDER BY q.id DESC
        ")
            ->get();

        sendResponse(true, "Questions fetched successfully", $questions);
    }
    // delete questions
    public function deleteQuestion($id)
    {
        $id = trim($id);

        if ($id == "") {
            sendResponse(false, "Question id is required");
        }

        $this->db
            ->query("
            DELETE FROM questions
            WHERE id = :id
        ")
            ->delete([
                "id" => $id
            ]);

        sendResponse(true, "Question deleted successfully");
    }

    // student attempts the quiz
    public function startAttempt($user_id, $subject_id)
    {
        $user_id = trim($user_id);
        $subject_id = trim($subject_id);

        if ($user_id == "") {
            sendResponse(false, "User id is required");
        }

        if ($subject_id == "") {
            sendResponse(false, "Subject id is required");
        }

        $this->db
            ->query("
            INSERT INTO attempts
            (user_id, subject_id, status, started_at)
            VALUES
            (:user_id, :subject_id, 'active', CURRENT_TIMESTAMP)
        ")
            ->create([
                "user_id" => $user_id,
                "subject_id" => $subject_id
            ]);

        $attempt = $this->db
            ->query("
            SELECT id
            FROM attempts
            WHERE user_id = :user_id
            AND subject_id = :subject_id
            ORDER BY id DESC
            LIMIT 1
        ")
            ->first([
                "user_id" => $user_id,
                "subject_id" => $subject_id
            ]);

        sendResponse(true, "Attempt started", [
            "attempt_id" => $attempt["id"]
        ]);
    }

    // submit the answers
    public function submitAnswer($attempt_id, $question_id, $selected_answer)
    {
        $attempt_id = trim($attempt_id);
        $question_id = trim($question_id);
        $selected_answer = strtoupper(trim($selected_answer));

        if ($attempt_id == "") {
            sendResponse(false, "Attempt id is required");
        }

        if ($question_id == "") {
            sendResponse(false, "Question id is required");
        }

        if ($selected_answer == "") {
            sendResponse(false, "Please select an answer");
        }

        if (!in_array($selected_answer, ["A", "B", "C", "D"])) {
            sendResponse(false, "Invalid answer");
        }

        $question = $this->db
            ->query("
            SELECT correct_answer
            FROM questions
            WHERE id = :question_id
        ")
            ->first([
                "question_id" => $question_id
            ]);

        if (!$question) {
            sendResponse(false, "Question not found");
        }

        $is_correct = ($selected_answer == $question["correct_answer"]) ? true : false;

        $alreadyAnswered = $this->db
            ->query("
            SELECT id
            FROM attempt_answers
            WHERE attempt_id = :attempt_id
            AND question_id = :question_id
        ")
            ->first([
                "attempt_id" => $attempt_id,
                "question_id" => $question_id
            ]);

        if ($alreadyAnswered) {
            sendResponse(false, "You already answered this question");
        }

        $this->db
            ->query("
            INSERT INTO attempt_answers
            (attempt_id, question_id, selected_answer, is_correct)
            VALUES
            (:attempt_id, :question_id, :selected_answer, :is_correct)
        ")
            ->create([
                "attempt_id" => $attempt_id,
                "question_id" => $question_id,
                "selected_answer" => $selected_answer,
                "is_correct" => $is_correct
            ]);

        sendResponse(true, "Answer submitted successfully");
    }

    public function finishQuiz($attempt_id)
    {
        $attempt_id = trim($attempt_id);

        if ($attempt_id == "") {
            sendResponse(false, "Attempt id is required");
        }

        $scoreData = $this->db
            ->query("
            SELECT COUNT(*) AS score
            FROM attempt_answers
            WHERE attempt_id = :attempt_id
            AND is_correct = true
        ")
            ->first([
                "attempt_id" => $attempt_id
            ]);

        $score = $scoreData["score"];

        $this->db
            ->query("
            UPDATE attempts
            SET 
                score = :score,
                status = 'completed',
                completed_at = CURRENT_TIMESTAMP,
                time_taken_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))
            WHERE id = :attempt_id
        ")
            ->update([
                "score" => $score,
                "attempt_id" => $attempt_id
            ]);

        sendResponse(true, "Quiz completed successfully", [
            "attempt_id" => $attempt_id,
            "score" => $score
        ]);
    }

    // quiz results
    public function getResult($attempt_id)
    {
        $attempt_id = trim($attempt_id);

        if ($attempt_id == "") {
            sendResponse(false, "Attempt id is required");
        }

        $attempt = $this->db
            ->query("
            SELECT 
                a.id,
                a.score,
                a.time_taken_seconds,
                s.subject_name,
                COUNT(aa.id) AS total_questions
            FROM attempts a
            JOIN subjects s ON s.id = a.subject_id
            LEFT JOIN attempt_answers aa ON aa.attempt_id = a.id
            WHERE a.id = :attempt_id
            GROUP BY a.id, s.subject_name
        ")
            ->first([
                "attempt_id" => $attempt_id
            ]);

        if (!$attempt) {
            sendResponse(false, "Result not found");
        }

        $wrongAnswers = $this->db
            ->query("
            SELECT 
                q.question,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_answer,
                aa.selected_answer
            FROM attempt_answers aa
            JOIN questions q ON q.id = aa.question_id
            WHERE aa.attempt_id = :attempt_id
            AND aa.is_correct = false
        ")
            ->get([
                "attempt_id" => $attempt_id
            ]);

        sendResponse(true, "Result fetched successfully", [
            "attempt" => $attempt,
            "wrong_answers" => $wrongAnswers
        ]);
    }

    // see the student results
    public function getMyResults($user_id)
    {
        $user_id = trim($user_id);

        if ($user_id == "") {
            sendResponse(false, "User id is required");
        }

        $results = $this->db
            ->query("
            SELECT 
                a.id AS attempt_id,
                s.subject_name,
                a.score,
                a.time_taken_seconds,
                a.created_at,
                COUNT(aa.id) AS total_questions
            FROM attempts a
            JOIN subjects s ON s.id = a.subject_id
            LEFT JOIN attempt_answers aa ON aa.attempt_id = a.id
            WHERE a.user_id = :user_id
            AND a.status = 'completed'
            GROUP BY a.id, s.subject_name
            ORDER BY a.id DESC
        ")
            ->get([
                "user_id" => $user_id
            ]);

        sendResponse(true, "Results fetched successfully", $results);
    }

    // see all results 
    public function getAllResults()
    {
        $results = $this->db
            ->query("
            SELECT 
                a.id AS attempt_id,
                u.first_name,
                u.last_name,
                u.email,
                s.subject_name,
                a.score,
                a.time_taken_seconds,
                a.created_at,
                COUNT(aa.id) AS total_questions
            FROM attempts a
            JOIN users u ON u.id = a.user_id
            JOIN subjects s ON s.id = a.subject_id
            LEFT JOIN attempt_answers aa ON aa.attempt_id = a.id
            WHERE a.status = 'completed'
            GROUP BY 
                a.id,
                u.first_name,
                u.last_name,
                u.email,
                s.subject_name
            ORDER BY a.id DESC
        ")
            ->get();

        sendResponse(true, "All results fetched successfully", $results);
    }

    // dashboard stats
    public function getDashboardStats()
    {
        $questions = $this->db
            ->query("SELECT COUNT(*) AS total FROM questions")
            ->first();

        $attempts = $this->db
            ->query("SELECT COUNT(*) AS total FROM attempts WHERE status = 'completed'")
            ->first();

        $students = $this->db
            ->query("SELECT COUNT(*) AS total FROM users WHERE role = 'student'")
            ->first();

        $bestScore = $this->db
            ->query("SELECT COALESCE(MAX(score), 0) AS total FROM attempts")
            ->first();

        sendResponse(true, "Dashboard stats fetched", [
            "questions" => $questions["total"],
            "attempts" => $attempts["total"],
            "students" => $students["total"],
            "best_score" => $bestScore["total"]
        ]);
    }
}
