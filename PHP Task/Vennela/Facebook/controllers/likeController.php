<?php
require_once "../utils/pdo.php";
class LikeController {
    private $pdo;
    public function __construct() {
        $this->pdo = getPDO();
    }
      public function toggleLike($post_id, $user_id) {
    $stmt = $this->pdo->prepare(
        "SELECT id FROM likes WHERE post_id=? AND user_id=?"
    );
    $stmt->execute([$post_id, $user_id]);

    if ($stmt->rowCount() > 0) {
        $this->pdo->prepare(
            "DELETE FROM likes WHERE post_id=? AND user_id=?"
        )->execute([$post_id, $user_id]);
        $liked = false;
    } else {
        $this->pdo->prepare(
            "INSERT INTO likes(post_id, user_id) VALUES(?,?)"
        )->execute([$post_id, $user_id]);
        $liked = true;
    }
    $stmt = $this->pdo->prepare(
        "SELECT COUNT(*) FROM likes WHERE post_id=?"
    );
    $stmt->execute([$post_id]);
    $count = $stmt->fetchColumn();
    return [
        "likes" => $count,
        "liked" => $liked
    ];
}
public function likePost($post_id, $user_id) {
    $stmt = $this->pdo->prepare(
        "SELECT 1 FROM likes WHERE post_id=? AND user_id=?"
    );
    $stmt->execute([$post_id, $user_id]);
    $alreadyLiked = $stmt->fetchColumn();
    if (!$alreadyLiked) {
        $this->pdo->prepare(
            "INSERT INTO likes(post_id, user_id) VALUES(?,?)"
        )->execute([$post_id, $user_id]);
    }
    $stmt = $this->pdo->prepare(
        "SELECT COUNT(*) FROM likes WHERE post_id=?"
    );
    $stmt->execute([$post_id]);
    $count = $stmt->fetchColumn();
    return [
        "likes" => $count,
        "alreadyLiked" => (bool)$alreadyLiked
    ];
}
}