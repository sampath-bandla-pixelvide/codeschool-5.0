<?php
require_once __DIR__ . "/controllers/ProductController.php";

$searchInput = $_GET['searchInput'];

$productControl = new ProductControllers();
echo $productControl->getSearchItem($searchInput);