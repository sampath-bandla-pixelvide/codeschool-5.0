<?php
require_once(__DIR__ . '/../config/db.php');
class QuestionController
{
    private $db;
    public function __construct()
    {
        $this->db = new DB();
    }
    // public function getQuestions($quizId)
    // {
    //     return $this->db->query(
    //         "SELECT * FROM questions
    //          WHERE quiz_id = :qid AND status = true
    //          ORDER BY id ASC"
    //     )->get(['qid' => $quizId]);
    // }
    public function getQuestions($quizId)
    {
        // get all questions
        $questions = $this->db->query("
        SELECT id, question_text
        FROM questions
        WHERE quiz_id = :qid AND status = true
        ORDER BY id ASC
        ")->get(['qid' => $quizId]);

        // attach options to each question
        foreach ($questions as &$q) {

            $options = $this->db->query("
            SELECT id, option_text, is_correct
            FROM options
            WHERE question_id = :qid AND status = true
            ORDER BY id ASC
        ")->get(['qid' => $q['id']]);

            $q['options'] = $options;
        }

        return [
            "status" => true,
            "data" => $questions
        ];
    }
    public function createQuestion($quizId, $questionText, $options)
    {
        if (!$quizId || !$questionText || count($options) !== 4) {
            return ["status" => false, "message" => "Invalid input"];
        }
        // only 1 correct option 
        $c = 0;
        foreach ($options as $opt) {
            // var_dump($opt);

            if (!empty($opt['is_correct'])) $c++;
        }
        if ($c !== 1) return ["status" => false, "message" => "Exactly one correct option required"];
        $this->db->query("
            INSERT INTO questions (quiz_id, question_text, marks)
            VALUES (:quiz_id, :question_text, 1)
            RETURNING id
        ");
        // INSERT without RETURNING → no result set
        // fetch() only works when there is a result set
        $question = $this->db->first([
            'quiz_id' => $quizId,
            'question_text' => $questionText
        ]);
        $questionId = $question['id'];
        foreach ($options as $opt) {
            $this->db->run("
                INSERT INTO options (question_id, option_text, is_correct)
                VALUES (:question_id, :option_text, :is_correct)
            ", [
                'question_id' => $questionId,
                'option_text' => $opt['text'],
                'is_correct' => $opt['is_correct'] ? 1 : 0
            ]);
        }

        return [
            "status" => true
        ];
    }
    public function updateQuestion($questionId, $questionText, $options)
    {
        if (!$questionId || !$questionText || count($options) !== 4) {
            return ["status" => false, "message" => "Invalid input"];
        }

        $correctCount = 0;
        foreach ($options as $opt) {

            if (!empty($opt['is_correct'])) {
                $correctCount++;
            }
        }

        if ($correctCount !== 1) {
            return ["status" => false, "message" => "Exactly one correct option required"];
        }

        // check question exists
        $existing = $this->db->query(
            "SELECT id FROM questions WHERE id = :id"
        )->first(['id' => $questionId]);

        if (!$existing) {
            return ["status" => false, "message" => "Question not found"];
        }

        // update question text
        $this->db->run("
        UPDATE questions
        SET question_text = :text, updated_at = NOW()
        WHERE id = :id
    ", [
            'text' => $questionText,
            'id' => $questionId
        ]);

        // make status=false for old options
        $this->db->run("
        UPDATE options
        SET status = false, updated_at = NOW()
        WHERE question_id = :qid
    ", ['qid' => $questionId]);

        // insert new options
        foreach ($options as $opt) {
            $this->db->run("
            INSERT INTO options (question_id, option_text, is_correct)
            VALUES (:qid, :text, :correct)
        ", [
                'qid' => $questionId,
                'text' => $opt['text'],
                'correct' => $opt['is_correct'] ? 1 : 0
            ]);
        }

        return ["status" => true];
    }
    public function deleteQuestion($questionId)
    {
        if (!$questionId) {
            return ["status" => false, "message" => "Question ID required"];
        }

        // check exists
        $existing = $this->db->query(
            "SELECT id FROM questions WHERE id = :id"
        )->first(['id' => $questionId]);

        if (!$existing) {
            return ["status" => false, "message" => "Question not found"];
        }
        $this->db->run("
        update questions set status=false, updated_at = NOW() WHERE id = :id
    ", ['id' => $questionId]);

        return ["status" => true];
    }
}
