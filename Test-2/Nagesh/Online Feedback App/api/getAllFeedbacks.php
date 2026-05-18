<?php

require_once "../controllers/FeedbackController.php";

$userId = $_GET['userId'] ?? null;

if (!$userId) {
    echo json_encode(['status' => false, 'message' => 'User ID is required']);
    exit;
}

$feedbackController = new FeedbackController();
$feedbackController->getAllFeedbacks($userId);
