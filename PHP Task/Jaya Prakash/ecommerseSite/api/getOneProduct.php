<?php
require_once __DIR__ . "/controllers/ProductController.php";

$id = $_GET['id'];

$productControl = new ProductControllers();
echo $productControl->getOneProduct($id);