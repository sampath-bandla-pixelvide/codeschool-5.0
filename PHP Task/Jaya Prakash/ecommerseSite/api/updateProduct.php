<?php
require_once __DIR__ . "/controllers/AdminControllers.php";

$token = $_POST['userToken'] ?? null;

$id = $_POST['id'] ?? null;
$name = $_POST['name'] ?? '';
$category = $_POST['category'] ?? '';
$stock = $_POST['stock'] ?? '';
$price = $_POST['price'] ?? '';
$description = $_POST['description'] ?? '';
$file = $_FILES['image'] ?? null;

$filename = null;
if ($file && $file['error'] === 0) {
    $filename = time() . "_" . basename($file["name"]);
    if(!move_uploaded_file($file['tmp_name'], "../uploads/" . $filename)){
        die(sendResponse(false,"failed to save the file"));
    }
}

$adminControl = new AdminControllers();
echo $adminControl->updateProduct($token, $id, $name, $category, $stock, $price, $description, $filename);