<?php

require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../config/helperFunction.php";

class ProductController
{
    private $db;

    public function __construct()
    {
        $this->db = new DB();
    }

    public function uploadProduct(
        $title,
        $description,
        $endTime,
        $image,
        $userId
    ) {

        /* CREATE UPLOAD FOLDER */

        $uploadFolder = __DIR__ . "/../assets/uploads/";

        if (!file_exists($uploadFolder)) {

            mkdir($uploadFolder, 0777, true);
        }



        /* FILE NAME */

        $fileName = time() . "_" . basename($image['name']);



        /* FULL SERVER PATH */

        $fullPath = $uploadFolder . $fileName;



        /* DATABASE PATH */

        $dbPath = "./assets/uploads/" . $fileName;



        /* MOVE IMAGE */

        move_uploaded_file(
            $image['tmp_name'],
            $fullPath
        );



        /* INSERT QUERY */

        $query = "
    INSERT INTO products
    (
        title,
        description,
        image_path,
        feedback_end_time,
        created_by
    )
    VALUES
    (
        :title,
        :description,
        :image,
        :endTime,
        :userId
    )
    ";

        $this->db->query($query);



        /* INSERT DATA */

        $status = $this->db->create([

            ':title' => $title,

            ':description' => $description,

            ':image' => $dbPath,

            ':endTime' => $endTime,

            ':userId' => $userId
        ]);



        if ($status) {

            sendResponse(
                true,
                "Product Uploaded Successfully"
            );
        }

        sendResponse(false, "Upload Failed");
    }
    public function deleteProduct($productId)
    {

        $selectQuery = "
    SELECT image_path
    FROM products
    WHERE id = :id
    ";

        $this->db->query($selectQuery);

        $product = $this->db->first([
            ':id' => $productId
        ]);



        if (!$product) {

            sendResponse(false, "Product not found");
        }



        /* SERVER FILE PATH */

        $serverPath = __DIR__ . "/.." . str_replace("./", "/", $product['image_path']);



        /* DELETE IMAGE */

        if (file_exists($serverPath)) {

            unlink($serverPath);
        }



        /* DELETE PRODUCT */

        $deleteQuery = "
    DELETE FROM products
    WHERE id = :id
    ";

        $this->db->query($deleteQuery);

        $status = $this->db->delete([
            ':id' => $productId
        ]);



        if ($status) {

            sendResponse(
                true,
                "Product deleted successfully"
            );
        }

        sendResponse(false, "Delete failed");
    }

    public function getProducts()
    {

        $query = "
        SELECT * FROM products
        ORDER BY id DESC
        ";

        $this->db->query($query);

        $products = $this->db->get();

        sendResponse(
            true,
            "Products fetched",
            $products
        );
    }
}
