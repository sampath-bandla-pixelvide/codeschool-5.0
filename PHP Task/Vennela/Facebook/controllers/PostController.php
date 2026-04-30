<?php
require_once "../utils/pdo.php";

class PostController {
    private $pdo;
    public function __construct() {
        $this->pdo = getPDO();
    }
    public function createPost($text, $fileName, $user_id) {
        $sql = "
        INSERT INTO posts (text, file, user_id) 
        VALUES (:text, :file, :user_id)
        ";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            ':text' => $text,
            ':file' => $fileName,
            ':user_id' => $user_id
        ]);
    }
    public function getPosts($user_id) {
        $sql = "
        SELECT 
            p.id,
            p.text,
            p.file,
            p.user_id,
            p.created_at,
            u.first_name || ' ' || u.last_name AS full_name,
            u.profile_pic,
            COUNT(l.id) AS like_count,
            COALESCE(BOOL_OR(l.user_id = :user_id), false) AS liked
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN likes l ON p.id = l.post_id
            WHERE p.status = TRUE
            GROUP BY 
                p.id, p.text, p.file, p.user_id, p.created_at,
                u.first_name, u.last_name, u.profile_pic
            ORDER BY p.created_at DESC
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['user_id' => $user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>