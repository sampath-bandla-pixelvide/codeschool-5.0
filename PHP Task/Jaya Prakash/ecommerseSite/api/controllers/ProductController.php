<?php
require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";

class ProductControllers
{
    private $db = null;
    function __construct()
    {
        $this->db = new DB();
    }

    private function getUserIdByToken($token)
    {
        $userData = $this->db->query("SELECT user_id FROM user_tokens WHERE token=:token AND status=true")->get([":token" => $token]);
        return $userData['user_id'];
    }

    public function getCategories()
    {
        $data = $this->db->query("SELECT id,category_name FROM categories WHERE status = true")->getAll();
        return sendResponse(true, "Categories fetched", [], $data);
    }

    public function getOneProduct($id)
    {
        $product = $this->db->query("SELECT p.id AS product_id, p.product_name, p.stock, p.price, p.product_description,p.product_image,c.id AS category_id,c.category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = :id AND p.status=true")->get([":id" => $id]);
        if (!$product) {
            return sendResponse(false, "Not found");
        }

        return sendResponse(true, "Fetched", [], $product);
    }

    public function getProducts($category)
    {
        if ($category === 'all') {
            $products = $this->db->query("SELECT p.id, p.product_name, p.stock, p.price, p.product_description, p.product_image, c.category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status=true ORDER BY p.id DESC")->getAll();
            if (!$products) {
                return sendResponse(false, "No products found");
            }
        } else {
            $products = $this->db->query("SELECT p.id, p.product_name, p.stock, p.price, p.product_description, p.product_image, c.category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = true AND p.category_id = :cat ORDER BY p.id DESC")
                ->getAll([
                    ":cat" => $category
                ]);

            if (!$products) {
                return sendResponse(false, "No products found");
            }
        }

        return sendResponse(true, "Products fetched", [], $products);
    }

    public function getSearchItem($searchInput)
    {
        $pattern = "%" . $searchInput . "%";
        $searchResult = $this->db->query("SELECT id,product_image,product_name FROM products WHERE product_name ILIKE :pattern AND status=true")->getAll([":pattern"=>$pattern]);
        return sendResponse(true,"search items fetched",[],$searchResult);
    }
}
