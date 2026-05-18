<?php

require_once "../controllers/FeedbackController.php";

$productId = $_POST['productId'];
$userId = $_POST['userId'] ?? null;

$feedbackController = new FeedbackController();
$feedbackController->getFeedbacks($productId, $userId);