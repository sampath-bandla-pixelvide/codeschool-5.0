<?php

require_once "../controllers/ProductController.php";
require_once "../config/helperFunction.php";

if ($_SERVER['REQUEST_METHOD'] !== "POST") {
    sendResponse(false, "Invalid Request Method");
}

$productId = trim($_POST['productId'] ?? '');

if (empty($productId)) {
    sendResponse(false, "Product Id is required");
}

$productController = new ProductController();

$productController->deleteProduct($productId);