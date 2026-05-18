<?php

require_once "../controllers/ProductController.php";

$title = $_POST['title'];

$description = $_POST['description'];

$endTime = $_POST['endTime'];

$image = $_FILES['image'];

$userId = $_POST['userId'];

$productController = new ProductController();

$productController->uploadProduct(
    $title,
    $description,
    $endTime,
    $image,
    $userId
);
