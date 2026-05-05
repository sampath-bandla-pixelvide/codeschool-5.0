<?php

  require_once("./utils/functions.php");
  require_once __DIR__ . '/controllers/productsController.php';

  $method = $_SERVER['REQUEST_METHOD'];

  if ($method === "POST") {

    $id = $_POST['id'];
    $delete_id = $_POST['delete_id'];

    $product_name = $_POST['product_name'];
    $price = $_POST['price'];
    $stock = $_POST['stock'];
    $category = $_POST['category_id'];
    $description = $_POST['description'];


    $imagePath = null;

  if (!empty($_FILES['image']['name'])) {

    $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);

    $filename = strtolower(str_replace(' ', '-', $_POST['product_name']));
    $filename = $filename . "-" . time() . "." . $ext;

    $target = "../uploads/products/" . $filename;

    if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
        $imagePath = "uploads/products/" . $filename;
    }
  }

    $prod = new productsController();

    if ($delete_id) {
      $prod->deleteProduct($delete_id);
      sendResponse(true,"Deleted successfully");
      exit;
    }

    if ($id) {
      $prod->updateProduct($id, $product_name, $price, $stock, $category, $description,$imagePath);
      sendResponse(true,"Updated successfully");
      exit;
    }

    $prod->setProducts($product_name,$price,$stock,$category,$description, $imagePath);
    exit();


  }

  if ($method === "GET") {
    $prod = new productsController();
    echo json_encode($prod->getProducts());
    exit();
    
  }

  

