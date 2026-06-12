<?php
require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";

class CartControllers
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

    public function addToCart($token, $productId, $quantity)
    {
        $userId = $this->getUserIdByToken($token);

        if (!$userId) {
            return sendResponse(false, "Invalid token");
        }

        if ($quantity < 1) {
            return sendResponse(false, "Invalid quantity");
        }

        $product = $this->db->query("SELECT stock FROM products WHERE id = :id")->get([":id" => $productId]);
        if (!$product) {
            return sendResponse(false, "Product not found");
        }

        if ($quantity > $product['stock']) {
            return sendResponse(false, "Exceeds stock quantity!!");
        }

        $cart = $this->db->query("SELECT id FROM carts WHERE customer_id = :user_id")->get([":user_id" => $userId]);

        if (!$cart) {
            $this->db->query("INSERT INTO carts (customer_id) VALUES (:uid)")->execute([":uid" => $userId]);
            $cart = $this->db->query("SELECT id FROM carts WHERE customer_id = :uid")->get([":uid" => $userId]);
        }
        $cartId = $cart['id'];

        $existing = $this->db->query("SELECT id, quantity FROM cart_items WHERE cart_id = :cid AND product_id = :pid")->get([":cid" => $cartId, ":pid" => $productId]);

        if ($existing) {
            $newQuantity = $existing['quantity'] + $quantity;
            if ($newQuantity > $product['stock']) {
                return sendResponse(false, "Exceeds stock");
            }
            $this->db->query("UPDATE cart_items SET quantity = :qty WHERE id = :id")->execute([":qty" => $newQuantity, ":id" => $existing['id']]);
        } else {
            $this->db->query("INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (:cid, :pid, :qty)")->execute([":cid" => $cartId, ":pid" => $productId, ":qty" => $quantity]);
        }
        return sendResponse(true, "Added to cart");
    }

    public function getCartItems($token)
    {
        $userId = $this->getUserIdByToken($token);
        if (!$userId) {
            return sendResponse(false, "invalid user token");
        }
        $cart = $this->db->query("SELECT c.id as cart_id, product_id, product_name,product_image,ct.quantity,price,stock FROM carts c INNER JOIN cart_items ct ON c.id=ct.cart_id JOIN products p on p.id=ct.product_id WHERE c.customer_id=:id;")->getAll([":id" => $userId]);
        if (!$cart) {
            return sendResponse(false, "Cart is empty!!");
        }
        return sendResponse(true, "cart fetched", [], $cart);
    }

    public function updateCartItem($token, $productId, $quantity)
    {
        $userId = $this->getUserIdByToken($token);
        if (!$userId) {
            return sendResponse(false, "Invalid token");
        }
        if ($quantity < 1) {
            return sendResponse(false, "Invalid quantity");
        }
        $product = $this->db->query("SELECT price, stock FROM products WHERE id = :id")->get([":id" => $productId]);
        if (!$product) {
            return sendResponse(false, "Product not found");
        }
        if ($quantity > $product['stock']) {
            return sendResponse(false, "Exceeds stock");
        }
        $cart = $this->db->query("SELECT id FROM carts WHERE customer_id = :uid")->get([":uid" => $userId]);
        if (!$cart) {
            return sendResponse(false, "Cart not found");
        }
        $this->db->query("UPDATE cart_items SET quantity = :qty WHERE cart_id = :cid AND product_id = :pid")
            ->execute([
                ":qty" => $quantity,
                ":cid" => $cart['id'],
                ":pid" => $productId
            ]);
        $data['price'] = $product['price'];
        return sendResponse(true, "Updated", [], $data);
    }

    public function removeCartItem($token, $productId)
    {
        $userId = $this->getUserIdByToken($token);
        if (!$userId) {
            return sendResponse(false, "Invalid token");
        }
        $cart = $this->db->query("SELECT id FROM carts WHERE customer_id = :uid")->get([":uid" => $userId]);
        if (!$cart) {
            return sendResponse(false, "Cart not found");
        }
        $this->db->query("DELETE FROM cart_items WHERE cart_id = :cid AND product_id = :pid")->execute([":cid" => $cart['id'], ":pid" => $productId]);
        return sendResponse(true, "Item removed");
    }

    public function getCardDetails($token)
    {
        $userId = $this->getUserIdByToken($token);
        if (!$userId) {
            return sendResponse(false, "Invalid token");
        }
        $cart = $this->db->query("SELECT c.id as cart_id, product_name,ct.quantity,price FROM carts c INNER JOIN cart_items ct ON c.id=ct.cart_id JOIN products p on p.id=ct.product_id WHERE c.customer_id=:id;")->getAll([":id" => $userId]);
        return sendResponse(true, "cart Details fetched", [], $cart);
    }
}
