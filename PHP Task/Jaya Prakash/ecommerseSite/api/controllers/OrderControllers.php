<?php
require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";

class OrderControllers
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

    public function orderCartProducts($token, $addressId, $paymode, $product_Id)
    {
        $userId = $this->getUserIdByToken($token);
        $paymode = strtoupper($paymode);

        if (!$product_Id) {

            $user_cart_data = $this->db->query("SELECT id FROM carts WHERE customer_id=:id")->get([":id" => $userId]);

            $userCartId = $user_cart_data['id'];

            if (!$userCartId) {
                return sendResponse(false, "User cart is empty");
            }

            $amount = $this->db->query("SELECT sum(p.price * ci.quantity) as total_cart_price FROM cart_items ci INNER JOIN products p ON ci.product_id=p.id WHERE cart_id=:id GROUP BY ci.cart_id")
                ->get([":id" => $userCartId]);

            $total_amount = $amount['total_cart_price'];

            $cartItems = $this->db->query("SELECT ci.product_id,ci.quantity,p.price FROM cart_items ci INNER JOIN products p on ci.product_id=p.id WHERE cart_id=:id")->getAll([":id" => $userCartId]);

            $orderId = $this->db->query("INSERT INTO orders (customer_id,total_amount,address_id) VALUES (:customer_id,:amount,:address_id)  RETURNING id")->get([":customer_id" => $userId, ":amount" => $total_amount, ":address_id" => $addressId]);

            foreach ($cartItems as $item) {
                $productId = $item['product_id'];
                $quantity  = $item['quantity'];
                $price     = $item['price'];

                $product = $this->db->query("SELECT stock,product_name FROM products WHERE id = :id")->get([":id" => $productId]);

                if ($product['stock'] < $quantity) {
                    return sendResponse(false, "Insufficient stock for product ID: " . $product['product_name']);
                }

                $this->db->query("INSERT INTO order_details (order_id, product_id, quantity, unit_price) VALUES (:order_id, :product_id, :quantity, :price)")
                    ->execute([
                        ":order_id"   => $orderId['id'],
                        ":product_id" => $productId,
                        ":quantity"   => $quantity,
                        ":price"      => $price
                    ]);

                $this->db->query("UPDATE products SET stock = stock - :qty WHERE id = :id")->execute([":qty" => $quantity, ":id"  => $productId]);
            }

            $this->db->query("DELETE FROM cart_items WHERE cart_id=:id")->execute([':id' => $userCartId]);
        } else {
            
            $orderItem = $this->db->query("SELECT * FROM products WHERE id=:id")->get([":id" => $product_Id]);
            $quantity  = 1;
            $total_amount     = $orderItem['price'];
            
            $orderId = $this->db->query("INSERT INTO orders (customer_id,total_amount,address_id) VALUES (:customer_id,:amount,:address_id)  RETURNING id")->get([":customer_id" => $userId, ":amount" => $total_amount , ":address_id" => $addressId]);

            if ($orderItem['stock'] < 1) {
                return sendResponse(false, "Insufficient stock for product ID: " . $orderItem['product_name']);
            }

            $this->db->query("INSERT INTO order_details (order_id, product_id, quantity, unit_price) VALUES (:order_id, :product_id, :quantity, :price)")
                ->execute([
                    ":order_id"   => $orderId['id'],
                    ":product_id" => $product_Id,
                    ":quantity"   => $quantity,
                    ":price"      => $total_amount
                ]);

            $this->db->query("UPDATE products SET stock = stock - :qty WHERE id = :id")->execute([":qty" => $quantity, ":id"  => $product_Id]);
        }

        $this->db->query("INSERT INTO payments (order_id,payment_type,amount,payment_status) VALUES (:order_id,:paymode,:amount,:pay_status)")->execute([":order_id" => $orderId['id'], ":paymode" => $paymode, ":amount" => $total_amount , ":pay_status" => "SUCCESS"]);

        return sendResponse(true, "orders_updated");
    }

    public function getUserOrders($token, $status)
    {
        $userId = $this->getUserIdByToken($token);
        if (!$userId) {
            return sendResponse(false, "Invalid Token");
        }

        if ($status == 1) {
            $order_status = 'Pending';
        } elseif ($status == 2) {
            $order_status = 'Shipped';
        } elseif ($status == 3) {
            $order_status = 'Delivered';
        } elseif ($status == 4) {
            $order_status = 'Canceled';
        } else {
            $userOrders = $this->db->query("SELECT p.product_name,p.product_image,od.unit_price,od.quantity,o.ordered_date,o.order_status,o.address_id FROM orders o JOIN order_details od ON o.id = od.order_id INNER JOIN products p ON od.product_id=p.id WHERE o.customer_id=:id;")
                ->getAll([":id" => $userId]);
            return sendResponse(true, "User Orders Fetched!!", [], $userOrders);
        }
        $userOrders = $this->db->query("SELECT p.product_name,p.product_image,od.unit_price,od.quantity,o.ordered_date,o.order_status,o.address_id FROM orders o JOIN order_details od ON o.id = od.order_id INNER JOIN products p ON od.product_id=p.id WHERE o.customer_id=:id AND order_status=:status;")
            ->getAll([":id" => $userId, ":status" => $order_status]);
        return sendResponse(true, "User Orders Fetched!!", [], $userOrders);
    }
}
