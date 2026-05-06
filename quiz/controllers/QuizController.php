<?php
require_once(__DIR__ . '/../config/db.php');
class QuizController
{
    private $db;
    public function __construct()
    {
        $this->db = new DB();
    }
    //admin
    public function getQuizzes($search = '', $subjectId = null, $page = 1, $limit = 7)
    {
        $offset = ($page - 1) * $limit;

        $sql = "select q.*,s.name as subject_name, 
        (select count(*) from questions where quiz_id=q.id and status=true) as questions_count
        from quizzes q
        join subjects s on s.id=q.subject_id
        where q.status=true";
        $params = [];
        $params['limit'] = (int)$limit;
        $params['offset'] = (int)$offset;
        if ($search) {
            // $sql .=" and q.title ilike :search";
            $sql .= " AND (q.title ILIKE :search OR s.name ILIKE :search)";
            $params['search'] = '%' . $search . '%';
        }
        if ($subjectId) {
            $sql .= " and q.subject_id=:sid";
            $params['sid'] = $subjectId;
        }
        $sql .= " order by q.created_at desc LIMIT :limit OFFSET :offset";
        $data = $this->db->query($sql)->get($params);
        // for total 
        $countSql = "SELECT COUNT(*) 
                 FROM quizzes q
                 JOIN subjects s ON s.id = q.subject_id
                 WHERE q.status = true";

        $countParams = [];

        if ($search) {
            $countSql .= " AND (q.title ILIKE :search OR s.name ILIKE :search)";
            $countParams['search'] = '%' . $search . '%';
        }

        if ($subjectId) {
            $countSql .= " AND q.subject_id = :sid";
            $countParams['sid'] = $subjectId;
        }

        // $total = $this->db->query($countSql)->get($countParams);
        $countResult = $this->db->query($countSql)->get($countParams);
        $total = isset($countResult[0]['count']) ? (int)$countResult[0]['count'] : 0;

        return [
            "data" => $data,
            "total" => $total
        ];
    }
    public function getQuizzesForUser($userId, $search = '')
    {
        $sql = "SELECT q.*,s.name AS subject_name,
                CASE 
                    WHEN a.id IS NOT NULL THEN true 
                    ELSE false 
                END AS attempted
            FROM quizzes q
            JOIN subjects s ON s.id = q.subject_id
            LEFT JOIN attempts a 
                ON a.quiz_id = q.id AND a.user_id = :uid
            WHERE q.status = true";

        $params = ['uid' => $userId];

        if ($search) {
            $sql .= " AND (q.title ILIKE :search OR s.name ILIKE :search)";
            $params['search'] = '%' . $search . '%';
        }

        $sql .= " ORDER BY q.created_at DESC";

        return $this->db->query($sql)->get($params);
    }
    public function createQuiz($subjectId, $title, $durationMins)
    {
        $this->db->run(
            "INSERT INTO quizzes (subject_id, title, duration_minutes)
             VALUES (:sid, :title, :dur)",
            [
                'sid'   => $subjectId,
                'title' => $title,
                'dur'   => $durationMins,

            ]
        );
        return $this->db->lastInsertId();
    }
    public function updateQuiz($id, $subjectId, $title, $durationMins)
    {
        // Recalculate total marks
        // $count = $this->db->query(
        //     "SELECT COUNT(*) as cnt FROM questions WHERE quiz_id = :id AND status = true"
        // )->first(['id' => $id]);

        // $totalMarks = $count['cnt'] * $marksPerQuestion;

        $this->db->run(
            "UPDATE quizzes SET subject_id = :sid, title = :title,
             duration_minutes = :dur,
             updated_at = NOW()
             WHERE id = :id",
            [
                'sid'   => $subjectId,
                'title' => $title,
                'dur'   => $durationMins,
                'id'    => $id
            ]
        );
        return true;
    }
    public function deleteQuiz($id)
    {
        $this->db->run(
            "UPDATE quizzes SET status = false, updated_at = NOW() WHERE id = :id",
            ['id' => $id]
        );
        return true;
    }
    public function getById($id)
    {
        return $this->db->query(
            "SELECT * FROM quizzes WHERE id = :id AND status = true"
        )->first(['id' => $id]);
    }
}
