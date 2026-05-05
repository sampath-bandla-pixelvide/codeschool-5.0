<?php

require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";

class ordersController {
    private $db = null;

    function __construct()
    {
        $this->db = new DB();
    }

   
    // public function createOrder($user_id, $product_id, $quantity = 1) {
    //     $this->db->query("SELECT price FROM products WHERE id = :product_id");
    //     $product = $this->db->first([
    //         'product_id' => $product_id
    //     ]);

    //     if (!$product) {
    //         sendResponse(false, "Product not found");
    //         exit;
    //     }

    //     $price = $product['price'];
    //     $total = $price * $quantity;

        
    //     $this->db->query("
    //         INSERT INTO orders (user_id, total_amount)
    //         VALUES (:user_id, :total_amount)
    //     ");

    //     $this->db->prepare();
    //     $this->db->execute([
    //         'user_id' => $user_id,
    //         'total_amount' => $total
    //     ]);

    //     $order_id = $this->db->lastInsertId();

    //     $this->db->query("
    //         INSERT INTO ordered_products (order_id, product_id, quantity, price)
    //         VALUES (:order_id, :product_id, :quantity, :price)
    //     ");

    //     $result = $this->db->create([
    //         'order_id' => $order_id,
    //         'product_id' => $product_id,
    //         'quantity' => $quantity,
    //         'price' => $price
    //     ]);

    //     if (!$result) {
    //         sendResponse(false, "Order failed");
    //         exit;
    //     }

    //     sendResponse(true, "Order placed successfully");
    // }
 
    public function createOrder($user_id, $items, $address_id, $payment_method) {

    $total = 0;


    foreach ($items as $item) {

        $this->db->query("SELECT price FROM products WHERE id = :id");

        $product = $this->db->first([
            'id' => $item['product_id']
        ]);

        if (!$product) {
            sendResponse(false, "Product not found");
            return;
        }

        $total += $product['price'] * $item['quantity'];
    }

 
    $this->db->query("
        INSERT INTO orders (user_id, total_amount, address_id, payment_method)
        VALUES (:user_id, :total_amount, :address_id, :payment_method)
    ");

    $this->db->create([
        'user_id' => $user_id,
        'total_amount' => $total,
        'address_id' => $address_id,
        'payment_method' => $payment_method
    ]);

    $order_id = $this->db->lastInsertId();

    foreach ($items as $item) {

        $this->db->query("SELECT price FROM products WHERE id = :id");

        $product = $this->db->first([
            'id' => $item['product_id']
        ]);

         $price = $product['price'];

        $this->db->query("
            INSERT INTO ordered_products (order_id, product_id, quantity, price)
            VALUES (:order_id, :product_id, :quantity, :price)
        ");

        $this->db->create([
            'order_id' => $order_id,
            'product_id' => $item['product_id'],
            'quantity' => $item['quantity'],
            'price' => $price
        ]);
    }

    sendResponse(true, "Order placed successfully");
}
   
    public function getOrders($user_id) {

        $query = "
            SELECT 
                o.id AS order_id,
                o.user_id,
                p.product_name,
                op.quantity,
                op.price,
                o.order_status,
                o.created_at
            FROM orders o
            JOIN ordered_products op ON op.order_id = o.id
            JOIN products p ON p.id = op.product_id
            WHERE o.user_id = :user_id
            ORDER BY o.id DESC
        ";

        $this->db->query($query);

        return $this->db->get([
            'user_id' => $user_id
        ]);
    }

    public function updateStatus($order_id, $status) {

        $query = "UPDATE orders SET order_status = :status WHERE id = :id";

        $this->db->query($query);

        $result = $this->db->update([
            'id' => $order_id,
            'status' => $status
        ]);

        if (!$result) {
            sendResponse(false, "Status update failed");
            exit;
        }

        sendResponse(true, "Order status updated");
    }

    
    public function deleteOrder($order_id) {

        $query = "DELETE FROM orders WHERE id = :id";

        $this->db->query($query);

        return $this->db->delete([
            'id' => $order_id
        ]);
    }

    public function getAllOrders() {

    $query = "
        SELECT 
            o.id AS order_id,
            o.user_id,
            p.product_name,
            op.quantity,
            op.price,
            (op.price * op.quantity) AS item_total,
            o.total_amount,
            o.order_status
        FROM orders o
        JOIN ordered_products op ON op.order_id = o.id
        JOIN products p ON p.id = op.product_id
        ORDER BY o.id DESC
    ";

    $this->db->query($query);

    return $this->db->get();
    }
}