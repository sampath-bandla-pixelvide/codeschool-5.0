<?php
require_once __DIR__ . "/controllers/ProductController.php";
require_once __DIR__ . "/utils/functions.php";

$productControl = new ProductControllers();
echo $productControl->getCategories();