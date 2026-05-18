<?php

require_once __DIR__ . "/../controllers/ProductController.php";

$productController = new ProductController();

$productController->getProducts();