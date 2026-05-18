<?php

require_once "../controllers/FeedbackController.php";
require_once "../config/helperFunction.php";

if ($_SERVER['REQUEST_METHOD'] !== "POST") {
    sendResponse(false, "Invalid Request Method");
}

$productId = trim($_POST['productId'] ?? '');

$userId = trim($_POST['userId'] ?? '');

$feedback = trim($_POST['feedback'] ?? '');

$rating = trim($_POST['rating'] ?? '');





if (empty($productId)) {
    sendResponse(false, "Product Id is required");
}

if (empty($userId)) {
    sendResponse(false, "User Id is required");
}

if (empty($feedback)) {
    sendResponse(false, "Feedback is required");
}

if (strlen($feedback) < 5) {
    sendResponse(false, "Feedback should contain at least 5 characters");
}

if (empty($rating)) {
    sendResponse(false, "Rating is required");
}

if ($rating < 1 || $rating > 5) {
    sendResponse(false, "Rating should be between 1 and 5");
}





$feedbackController = new FeedbackController();

$feedbackController->addFeedback(
    $productId,
    $userId,
    $feedback,
    $rating
);