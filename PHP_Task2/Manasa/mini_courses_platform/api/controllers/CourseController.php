<?php

require_once __DIR__ . '/../utils/db.php';
require_once __DIR__ . '/../verifyToken.php';

class CourseController
{
    private $db;

    public function __construct()
    {
        $this->db = new DB();
    }

    public function createCourse($data)
    {

        $user = verifyToken();

        if (!$user) {
            return [
                "status" => "error",
                "message" => "Unauthorized"
            ];
        }

        if ($user['role'] !== 'admin') {
            return [
                "status" => "error",
                "message" => "Access denied"
            ];
        }

        $title = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');
        $price = $data['price'] ?? 0;
        $requiresApproval = $data['requires_approval'] ?? 0;

        if (!$title || !$description) {
            return [
                "status" => "error",
                "message" => "All fields required"
            ];
        }


        $this->db->query("
            INSERT INTO courses (title, description, price, created_by,requires_approval)
            VALUES (:title, :description, :price, :created_by,:requires_approval)
        ");

        $this->db->create([
            ":title" => $title,
            ":description" => $description,
            ":price" => $price,
            ":created_by" => $user['id'],
             ":requires_approval" => $requiresApproval
        ]);

        return [
            "status" => "success"
        ];
    }


    public function getCoursesByAdmin($adminId)
    {
        $this->db->query("SELECT * FROM courses WHERE created_by = :created_by");

        return $this->db->resultSet([
            ":created_by" => $adminId
        ]);
    }

    public function deleteCourse($data)
    {
        $user = verifyToken();

        if (!$user || $user['role'] !== 'admin') {
            return ["status" => "error", "message" => "Unauthorized"];
        }

        $course_id = $data['course_id'] ?? null;

        if (!$course_id) {
            return ["status" => "error", "message" => "Course ID required"];
        }


        $this->db->query("DELETE FROM courses WHERE id = :id");

        $this->db->delete([
            ":id" => $course_id
        ]);

        return ["status" => "success"];
    }

    public function addLesson($data)
    {
        $user = verifyToken();

        if (!$user) {
            return ["status" => "error", "message" => "Unauthorized"];
        }

        if ($user['role'] !== 'admin') {
            return ["status" => "error", "message" => "Access denied"];
        }

        $course_id = $data['course_id'] ?? null;
        $title = trim($data['title'] ?? '');
        $content = trim($data['content'] ?? '');
        $order = $data['lesson_order'] ?? 1;

        if (!$course_id || !$title) {
            return ["status" => "error", "message" => "Missing data"];
        }

        $this->db->query("
        INSERT INTO lessons (course_id, title, content, lesson_order)
        VALUES (:course_id, :title, :content, :lesson_order)
    ");

        $this->db->create([
            ":course_id" => $course_id,
            ":title" => $title,
            ":content" => $content,
            ":lesson_order" => $order
        ]);

        return ["status" => "success"];
    }

   public function getLessonsByCourse($course_id)
{
    $user = verifyToken();

    if (!$user) {
        return [];
    }

    $this->db->query("
    SELECT 
        l.*,
        CASE 
            WHEN lp.lesson_id IS NOT NULL THEN 1
            ELSE 0
        END AS is_completed
    FROM lessons l
    LEFT JOIN lesson_progress lp
        ON lp.lesson_id = l.id
        AND lp.user_id = :user_id
    WHERE l.course_id = :course_id
    ORDER BY l.lesson_order ASC
    ");

    return $this->db->get([
        ":course_id" => $course_id,
        ":user_id" => $user['id']
    ]);
}

    public function deleteLesson($data)
    {
        $user = verifyToken();

        if (!$user || $user['role'] !== 'admin') {
            return ["status" => "error", "message" => "Unauthorized"];
        }

        $lesson_id = $data['lesson_id'] ?? null;

        if (!$lesson_id) {
            return ["status" => "error", "message" => "Lesson ID required"];
        }

        $this->db->query("DELETE FROM lessons WHERE id = :id");

        $this->db->delete([
            ":id" => $lesson_id
        ]);

        return ["status" => "success"];
    }

    public function updateLesson($data)
    {
        $user = verifyToken();

        if (!$user || $user['role'] !== 'admin') {
            return ["status" => "error", "message" => "Unauthorized"];
        }

        $this->db->query("
        UPDATE lessons 
        SET title = :title, content = :content, lesson_order = :lesson_order
        WHERE id = :id
    ");

        $this->db->update([
            ":title" => $data['title'],
            ":content" => $data['content'],
            ":lesson_order" => $data['lesson_order'],
            ":id" => $data['lesson_id']
        ]);

        return ["status" => "success"];
    }

    public function getAllCourses()
    {
        $this->db->query("SELECT * FROM courses ORDER BY id DESC");
        return $this->db->resultSet();
    }
}
