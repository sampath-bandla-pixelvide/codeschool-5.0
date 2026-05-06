<?php

  require_once __DIR__ . "/../utils/db.php";
  require_once __DIR__ . "/../utils/functions.php";

  class productsController {
    private $db = null;

    function __construct()
    {
        $this->db = new DB();
    }

     public function setProducts($product_name,$price,$stock,$category,$description,$imagePath){
        
        $insertQuery = "INSERT INTO products
        (product_name,price,stock,category,description,image) 
        VALUES (:product_name,:price,:stock,:category,:description,:image)";

        $this->db->query($insertQuery);
        $result = $this->db->create([
            'product_name' => $product_name,
            'price' => $price,
            'stock' => $stock,
            'category' => $category,
            'description' => $description,
            'image' => $imagePath,
        ]);

        if(!$result) {
            sendResponse(false, "Something went wrong!");
        }
    }

    public function getProducts(){
      $query = "SELECT * FROM products ORDER BY id DESC";
      $this->db->query($query);
      $products = $this->db->get();

       return $products;

    }

    public function updateProduct($id, $product_name, $price, $stock, $category, $description,$imagePath) {

      $query = "UPDATE products 
                SET 
                  product_name = :product_name,
                  price = :price,
                  stock = :stock,
                  category = :category,
                  description = :description,
                  image = :imagePath
                WHERE id = :id";

  
      $this->db->query($query);

      $result = $this->db->update([
          'id' => $id,
          'product_name' => $product_name,
          'price' => $price,
          'stock' => $stock,
          'category' => $category,
          'description' => $description,
          'image' => $imagePath
      ]);

      if (!$result) {
        sendResponse(false,"Update failed");
        exit;
      }

      sendResponse(true,"product updated successfully");
      }

      public function deleteProduct($id) {

        $query = "DELETE FROM products WHERE id = :id";

        
        $this->db->query($query);

        return $this->db->delete([
            'id' => $id
        ]);
    }

    public function getUsers() {
    $query = "SELECT * FROM users ORDER BY id DESC";

    $this->db->query($query);
    return $this->db->get();
  }

}