<?php
require_once(__DIR__ . '/../config/db.php');
class SubjectController
{
    private $db;
    public function __construct()
    {
        $this->db = new DB();
    }
    public function create($name)
    {
        $exists = $this->db->query(
            "SELECT id FROM subjects WHERE LOWER(name) = LOWER(:name) AND status = true"
        )->first(['name' => $name]);

        if ($exists) {
            return ["status" => false, "message" => "Subject already exists"];
        }
        $this->db->run(
            "insert into subjects(name) values(:name)",
            ['name' => $name]
        );
        return true;
    }
    public function getSubjects()
    {
        $this->db->query("
            SELECT s.id, name,COUNT(q.id) AS quizzes_count
            FROM subjects s
            LEFT JOIN quizzes q 
            ON q.subject_id = s.id AND q.status = true
            WHERE s.status = true
            GROUP BY s.id, s.name
            ORDER BY s.created_at DESC;
        ");
        $subjects = $this->db->get();
        return $subjects;
    }
    public function updateSubject($id, $name)
    {
        $this->db->run(
            "UPDATE subjects SET name = :name, updated_at = NOW()
             WHERE id = :id",
            ['name' => $name, 'id' => $id]
        );
        return true;
    }
    public function deleteSubject($id)
    {
        // Block deletion if quizzes exist under this subject
        $count = $this->db->query(
            "SELECT COUNT(*) as cnt FROM quizzes
             WHERE subject_id = :id AND status = true"
        )->first(['id' => $id]);

        if ($count['cnt'] > 0) {
            return ['blocked' => true, 'message' => 'Cannot delete subject with active quizzes'];
        }

        $this->db->run(
            "UPDATE subjects SET status = false, updated_at = NOW() WHERE id = :id",
            ['id' => $id]
        );
        return ["status" => true];
    }
}
