<?php
require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";

class AdminControllers
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

    private function isAdmin($id)
    {
        $isAdmin = $this->db->query("SELECT 1 FROM users WHERE id=:id AND role='ADMIN'");
        if ($isAdmin) {
            return true;
        }
        return false;
    }

    public function getDashboardCardData($token)
    {
        $userId = $this->getUserIdByToken($token);
        $isAdmin = $this->isAdmin($userId);
        if ($isAdmin) {
            $userCount = $this->db->query("SELECT COUNT(*) AS count FROM users WHERE role='customer'")->get();
            $orderData = $this->db->query("SELECT COUNT(*) AS count,SUM(total_amount) AS total_revenue FROM orders")->get();
            $productsCount = $this->db->query("SELECT COUNT(*) AS count FROM products")->get();
            $data['usersCount'] = $userCount['count'];
            $data['ordersCount'] = $orderData['count'];
            $data['total_revenue'] = $orderData['total_revenue'];
            $data['productsCount'] = $productsCount['count'];

            return sendResponse(true, "data fetched!!", [], $data);
        } else {
            sendResponse(false, "Unauthorized Access!!");
        }
    }

    public function addProduct($token, $name, $category, $stock, $price, $description, $filename)
    {
        $userId = $this->getUserIdByToken($token);
        $isAdmin = $this->isAdmin($userId);
        if (!$isAdmin) {
            return sendResponse(false, "Unauthorized");
        }
        $this->db->query("INSERT INTO products (product_name, category_id, stock, price, product_description, product_image) VALUES (:name, :category, :stock, :price, :description, :filename)")
            ->execute([
                ":name" => $name,
                ":category" => $category,
                ":stock" => $stock,
                ":price" => $price,
                ":description" => $description,
                ":filename" => $filename
            ]);

        return sendResponse(true, "Product added successfully");
    }

    public function addCategory($token, $name)
    {
        $userId = $this->getUserIdByToken($token);
        $isAdmin = $this->isAdmin($userId);
        if (!$isAdmin) {
            return sendResponse(false, "Unauthorized");
        }
        $categoryExist = $this->db->query("SELECT 1 FROM categories WHERE category_name=:name AND status=true")->get([":name" => $name]);
        if ($categoryExist) {
            return sendResponse(false, "Category Already Exists!");
        }
        $this->db->query("INSERT INTO categories (category_name) VALUES (:name)")->execute([":name" => $name]);
        return sendResponse(true, "Category added successfully");
    }

    public function deleteCategory($id)
    {
        $this->db->query("UPDATE categories SET status=false WHERE id=:id")->execute([":id" => $id]);
        return sendResponse(true, "Category Deleted!!");
    }

    public function deleteProduct($token, $id)
    {
        $userId = $this->getUserIdByToken($token);
        $isAdmin = $this->isAdmin($userId);
        if (!$isAdmin) {
            return sendResponse(false, "Unauthorized");
        }

        $product = $this->db->query("SELECT product_image FROM products WHERE id=:id")->get([":id" => $id]);

        if ($product && $product['product_image']) {
            $filePath = __DIR__ . "/../uploads/" . $product['product_image'];
            unlink($filePath);
        }

        $this->db->query("UPDATE products SET status=false WHERE id = :id")->execute([":id" => $id]);
        return sendResponse(true, "Product deleted");
    }

    public function updateProduct($token, $id, $name, $category, $stock, $price, $description, $filename = null)
    {
        $userId = $this->getUserIdByToken($token);
        if (!$this->isAdmin($userId)) {
            return sendResponse(false, "Unauthorized");
        }
        if ($filename) {
            $this->db->query("UPDATE products SET product_name=:name, category_id=:category, stock=:stock, price=:price, product_description=:description, product_image=:image WHERE id=:id")
                ->execute([
                    ":name" => $name,
                    ":category" => $category,
                    ":stock" => $stock,
                    ":price" => $price,
                    ":description" => $description,
                    ":image" => $filename,
                    ":id" => $id
                ]);
        } else {
            $this->db->query("UPDATE products SET product_name=:name, category_id=:category, stock=:stock,price=:price,product_description=:description WHERE id=:id")
                ->execute([
                    ":name" => $name,
                    ":category" => $category,
                    ":stock" => $stock,
                    ":price" => $price,
                    ":description" => $description,
                    ":id" => $id
                ]);
        }

        return sendResponse(true, "Product updated");
    }

    public function getUsers()
    {
        $users = $this->db->query("SELECT id, first_name, last_name, email, phone_number, role FROM users WHERE status=true AND role='customer' ORDER BY id DESC")->getAll();
        return sendResponse(true, "Users fetched", [], $users);
    }

    public function deleteUser($id, $token)
    {
        $userId = $this->getUserIdByToken($token);
        if (!$this->isAdmin($userId)) {
            return sendResponse(false, "Unauthorized");
        }

        $this->db->query('UPDATE users SET status=false WHERE id=:id AND status=true')->execute([":id" => $id]);
        return sendResponse(true, "user deleted");
    }

    public function getOrders()
    {
        $orders = $this->db->query("SELECT o.id, CONCAT(u.first_name, ' ', u.last_name) AS customer_name, city,state,pin_code, o.total_amount, o.order_status, o.ordered_date FROM orders o JOIN users u ON o.customer_id = u.id JOIN address a on o.address_id=a.id ORDER BY o.id DESC")->getAll();
        if (!$orders) {
            return sendResponse(false, "No orders found");
        }
        return sendResponse(true, "Orders fetched", [], $orders);
    }

    public function updateOrderStatus($token, $order_id, $status)
    {
        $userId = $this->getUserIdByToken($token);
        if (!$this->isAdmin($userId)) {
            return sendResponse(false, "Unauthorized");
        }
        $this->db->query("UPDATE orders SET order_status=:status WHERE id=:id")->execute([":status"=>$status,":id"=>$order_id]);
        return sendResponse(true,"Order status updated!");
    }
}
