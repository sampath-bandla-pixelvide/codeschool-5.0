<?php
require_once __DIR__ . "/controllers/ProductController.php";

$category = $_GET['category'] ?? 'all';

$productControl = new ProductControllers();
echo $productControl->getProducts($category);