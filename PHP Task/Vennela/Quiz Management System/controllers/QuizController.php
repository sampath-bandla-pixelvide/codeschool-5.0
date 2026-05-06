<?php
require_once __DIR__ . "/../utils/pdo.php";

class QuizController {
    private $pdo;
    public function __construct() {
        $this->pdo = getPDO();
    }
    public function createFullQuiz($title, $subject_id, $questions) {
        if (!$title || !$subject_id || empty($questions)) {
            return ["success" => false, "message" => "Missing data"];
        }
        try {
            $this->pdo->beginTransaction();
            $totalMarks = count($questions);
            $stmt = $this->pdo->prepare("
                INSERT INTO quizzes (title, subject_id, total_marks, status)
                VALUES (:title, :subject_id, :marks, 'active')
                RETURNING id
            ");

            $stmt->execute([
                ":title" => $title,
                ":subject_id" => $subject_id,
                ":marks" => $totalMarks
            ]);

            $quiz_id = $stmt->fetchColumn();
            foreach ($questions as $q) {
                $qText = trim($q['question_text'] ?? '');
                $options = $q['options'] ?? [];
                if (!$qText || count($options) < 4) continue;
                $stmt = $this->pdo->prepare("
                    INSERT INTO questions (quiz_id, question_text, marks, status)
                    VALUES (:quiz_id, :text, 1, 'active')
                    RETURNING id
                ");

                $stmt->execute([
                    ":quiz_id" => $quiz_id,
                    ":text" => $qText
                ]);

                $question_id = $stmt->fetchColumn();
                $correctIndex = isset($q['correct']) ? (int)$q['correct'] : -1;
                foreach ($options as $i => $opt) {

                    $isCorrect = ($i === $correctIndex) ? 1 : 0;

                    $stmt = $this->pdo->prepare("
                        INSERT INTO options (question_id, option_text, is_correct, status)
                        VALUES (:qid, :text, :correct, 'active')
                    ");

                    $stmt->bindValue(":qid", $question_id, PDO::PARAM_INT);
                    $stmt->bindValue(":text", $opt, PDO::PARAM_STR);
                    $stmt->bindValue(":correct", $isCorrect, PDO::PARAM_BOOL);

                    $stmt->execute();
                }
            }

            $this->pdo->commit();
            return ["success" => true];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return [
                "success" => false,
                "message" => $e->getMessage()
            ];
        }
    }
    public function updateQuiz($quiz_id, $title, $subject_id, $questions) {

        try {
            $this->deleteQuiz($quiz_id);
            return $this->createFullQuiz($title, $subject_id, $questions);
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }
    public function deleteQuiz($quiz_id) {
    try {

        $this->pdo->beginTransaction();
        $stmt = $this->pdo->prepare("
            DELETE FROM options 
            WHERE question_id IN (
                SELECT id FROM questions WHERE quiz_id = :qid
            )
        ");
        $stmt->execute([":qid" => $quiz_id]);
        $stmt = $this->pdo->prepare("
            DELETE FROM questions WHERE quiz_id = :qid
        ");
        $stmt->execute([":qid" => $quiz_id]);
        $stmt = $this->pdo->prepare("
            DELETE FROM quizzes WHERE id = :qid
        ");
        $stmt->execute([":qid" => $quiz_id]);
        $this->pdo->commit();
        return ["success" => true];
    } catch (Exception $e) {
        $this->pdo->rollBack();
        return [
            "success" => false,
            "message" => $e->getMessage()
        ];
    }
}

}