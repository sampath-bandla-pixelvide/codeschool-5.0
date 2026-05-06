<?php
class CommentController {
    private $pdo;
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
public function addComment($post_id, $user_id, $comment) {
    $stmt = $this->pdo->prepare("
        INSERT INTO comments(post_id, user_id, comment)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$post_id, $user_id, $comment]);
    $stmt = $this->pdo->prepare("
        SELECT 
            first_name || ' ' || last_name AS full_name,
            profile_pic
        FROM users
        WHERE id = ?
    ");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return [
        "comment" => $comment,
        "full_name" => $user['full_name'],
        "profile_pic" => $user['profile_pic']
    ];
}
    public function getComments($post_id) {
        $stmt = $this->pdo->prepare("
            SELECT 
                c.comment,
                u.first_name || ' ' || u.last_name AS full_name,
                u.profile_pic
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at DESC
        ");
        $stmt->execute([$post_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}