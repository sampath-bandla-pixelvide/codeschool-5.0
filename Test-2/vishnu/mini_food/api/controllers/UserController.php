<?php
require_once __DIR__ . '/../utils/pdo.php';
require_once __DIR__ . '/../utils/db.php';
require_once __DIR__ . '/../utils/functions.php';

class UserController
{
    private DB $db;

    public function __construct()
    {
        $this->db = new DB();
    }

    private function authUser(): array
    {
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (empty($token)) {
            sendResponse(false, 'Unauthorized');
            exit;
        }
        $this->db->query(
            "SELECT u.* FROM users u
             JOIN user_tokens ut ON u.id = ut.user_id
             WHERE ut.token = :token AND ut.is_valid = TRUE AND ut.expires_at > NOW()"
        );
        $user = $this->db->first([':token' => $token]);
        if (!$user) {
            sendResponse(false, 'Unauthorized');
            exit;
        }
        return $user;
    }

    public function getDeliveryFee(): void
    {
        $this->db->query("SELECT value FROM site_settings WHERE key = 'delivery_fee'");
        $row = $this->db->first([]);
        sendResponse(true, 'OK', ['delivery_fee' => $row ? (float)$row['value'] : 30]);
    }

    public function getCategories(): void
    {
        $this->db->query("SELECT id, name FROM food_categories WHERE is_active = true ORDER BY name ASC");
        $cats = $this->db->rows([]);
        foreach ($cats as &$cat) {
            $this->db->query("SELECT photo_url FROM category_photos WHERE category_id = :id ORDER BY id ASC");
            $photos        = $this->db->rows([':id' => $cat['id']]);
            $cat['photos'] = array_column($photos, 'photo_url');
        }
        unset($cat);
        sendResponse(true, 'OK', $cats);
    }

    public function getMenu(): void
    {
        $catId  = (int)($_GET['category_id'] ?? 0);
        $search = trim($_GET['search'] ?? '');
        $veg    = $_GET['veg'] ?? '';

        $where  = ["fc.is_active = true"];
        $params = [];

        if ($catId) {
            $where[]           = "fi.category_id = :cat_id";
            $params[':cat_id'] = $catId;
        }
        if ($search !== '') {
            $where[]       = "(fi.name ILIKE :s OR fi.description ILIKE :s2)";
            $params[':s']  = "%$search%";
            $params[':s2'] = "%$search%";
        }
        if ($veg === '1') {
            $where[] = "fi.is_veg = true";
        } elseif ($veg === '0') {
            $where[] = "fi.is_veg = false";
        }

        $sql = "SELECT fi.id, fi.name, fi.description, fi.price, fi.is_veg,
                       fi.is_available, fi.category_id, fc.name AS category_name
                FROM food_items fi
                JOIN food_categories fc ON fc.id = fi.category_id
                WHERE " . implode(' AND ', $where) . "
                ORDER BY fi.is_available DESC, fi.name ASC";

        $this->db->query($sql);
        $items = $this->db->rows($params);

        foreach ($items as &$item) {
            $this->db->query("SELECT photo_url FROM food_photos WHERE food_id = :id ORDER BY id ASC");
            $photos              = $this->db->rows([':id' => $item['id']]);
            $item['photos']      = array_column($photos, 'photo_url');
            $item['is_veg']      = in_array($item['is_veg'],      ['t', 'true', '1', true, 1], true) ? 1 : 0;
            $item['is_available'] = in_array($item['is_available'], ['t', 'true', '1', true, 1], true) ? 1 : 0;
        }
        unset($item);
        sendResponse(true, 'OK', $items);
    }

    public function getOrderHistory(): void
    {
        $user = $this->authUser();
        $this->db->query(
            "SELECT o.id, o.total_amount, o.status, o.created_at,
                    o.delivery_name, o.delivery_mobile, o.subtotal, o.delivery_charge,
                    ua.address AS delivery_address, ua.city AS delivery_city, ua.pincode AS delivery_pincode,
                    (SELECT method FROM payments WHERE order_id = o.id ORDER BY id DESC LIMIT 1) AS payment_method,
                    (SELECT status FROM payments WHERE order_id = o.id ORDER BY id DESC LIMIT 1) AS payment_status
             FROM orders o
             LEFT JOIN user_addresses ua ON o.address_id = ua.id
             WHERE o.user_id = :uid
             ORDER BY o.created_at DESC"
        );
        $orders = $this->db->rows([':uid' => $user['id']]);
        foreach ($orders as &$order) {
            $this->db->query("SELECT food_name, quantity, unit_price, line_total FROM order_items WHERE order_id = :oid");
            $order['items'] = $this->db->rows([':oid' => $order['id']]);
        }
        unset($order);
        sendResponse(true, 'OK', $orders);
    }

    public function placeOrder(): void
    {
        $user      = $this->authUser();
        $body      = json_decode(file_get_contents('php://input'), true) ?? [];
        $name      = trim($body['name']       ?? '');
        $mobile    = trim($body['mobile']     ?? '');
        $addrId    = (int)($body['address_id'] ?? 0);
        $method    = trim($body['method']     ?? 'cod');
        $utr       = trim($body['utr']        ?? '');
        $items     = $body['items']            ?? [];

        if (!$name || !$mobile || !$addrId || empty($items)) {
            sendResponse(false, 'Name, mobile, a saved address and at least one item are required.');
        }

        $this->db->query("SELECT address, city, pincode FROM user_addresses WHERE id = :id AND user_id = :uid AND is_deleted = false");
        $addrRow = $this->db->first([':id' => $addrId, ':uid' => $user['id']]);
        if (!$addrRow) {
            sendResponse(false, 'Invalid or unauthorised address.');
        }

        $address = $addrRow['address'] . ', ' . $addrRow['city'];
        $pincode = $addrRow['pincode'];

        $allowed = ['cod', 'upi', 'netbanking', 'card', 'wallet'];
        if (!in_array($method, $allowed)) {
            $method = 'cod';
        }

        $subtotal       = 0;
        $this->db->query("SELECT value FROM site_settings WHERE key = 'delivery_fee'");
        $feeRow         = $this->db->first([]);
        $deliveryCharge = $feeRow ? (float)$feeRow['value'] : 30;
        $lineItems      = [];

        foreach ($items as $it) {
            $fid = (int)($it['id'] ?? 0);
            $qty = max(1, (int)($it['qty'] ?? 1));
            $this->db->query("SELECT id, name, price FROM food_items WHERE id = :id AND is_available = true");
            $food = $this->db->first([':id' => $fid]);
            if (!$food) continue;
            $lineTotal   = round((float)$food['price'] * $qty, 2);
            $subtotal   += $lineTotal;
            $lineItems[] = ['name' => $food['name'], 'price' => $food['price'], 'qty' => $qty, 'total' => $lineTotal, 'id' => $fid];
        }

        if (empty($lineItems)) {
            sendResponse(false, 'No valid items found.');
        }

        $total = $subtotal + $deliveryCharge;

        $this->db->query(
            "INSERT INTO orders (user_id, address_id, delivery_name, delivery_mobile,
             subtotal, delivery_charge, total_amount)
             VALUES (:uid,:aid,:nm,:mob,:sub,:dc,:total) RETURNING id"
        );
        $orderRow = $this->db->first([
            ':uid' => $user['id'],
            ':aid' => $addrId,
            ':nm' => $name,
            ':mob' => $mobile,
            ':sub' => $subtotal,
            ':dc' => $deliveryCharge,
            ':total' => $total
        ]);
        $orderId = (int)($orderRow['id'] ?? 0);
        if (!$orderId) {
            sendResponse(false, 'Could not create order.');
        }

        foreach ($lineItems as $li) {
            $this->db->query(
                "INSERT INTO order_items (order_id, food_id, food_name, quantity, unit_price, line_total)
                 VALUES (:oid,:fid,:fn,:qty,:up,:lt)"
            );
            $this->db->create([':oid' => $orderId, ':fid' => $li['id'], ':fn' => $li['name'], ':qty' => $li['qty'], ':up' => $li['price'], ':lt' => $li['total']]);
        }

        $this->db->query("INSERT INTO payments (order_id, user_id, method, amount, status, utr_reference) VALUES (:oid,:uid,:method,:amount,'pending',:utr)");
        $this->db->create([':oid' => $orderId, ':uid' => $user['id'], ':method' => $method, ':amount' => $total, ':utr' => $utr ?: null]);

        sendResponse(true, 'Order placed successfully!', ['order_id' => $orderId, 'total' => $total]);
    }

    public function getProfile(): void
    {
        $user = $this->authUser();
        sendResponse(true, 'OK', [
            'name'   => $user['name'],
            'email'  => $user['email'],
            'mobile' => $user['mobile'],
        ]);
    }

    public function updateProfile(): void
    {
        $user   = $this->authUser();
        $email  = trim($_POST['email']  ?? '');
        $mobile = trim($_POST['mobile'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, 'Invalid email address.');
        }
        if (!preg_match('/^[0-9]{10}$/', $mobile)) {
            sendResponse(false, 'Mobile must be 10 digits.');
        }

        $this->db->query("SELECT id FROM users WHERE email = :email AND id != :id");
        if ($this->db->first([':email' => $email, ':id' => $user['id']])) {
            sendResponse(false, 'Email already in use by another account.');
        }

        $this->db->query("SELECT id FROM users WHERE mobile = :mobile AND id != :id");
        if ($this->db->first([':mobile' => $mobile, ':id' => $user['id']])) {
            sendResponse(false, 'Mobile already in use by another account.');
        }

        $this->db->query("UPDATE users SET email = :email, mobile = :mobile WHERE id = :id");
        $this->db->update([':email' => $email, ':mobile' => $mobile, ':id' => $user['id']]);
        sendResponse(true, 'Profile updated successfully.');
    }

    public function getSavedAddresses(): void
    {
        $user = $this->authUser();
        $this->db->query(
            "SELECT id, label, address, city, pincode, is_default
             FROM user_addresses WHERE user_id = :uid AND is_deleted = false ORDER BY is_default DESC, created_at DESC"
        );
        sendResponse(true, 'OK', $this->db->rows([':uid' => $user['id']]));
    }

    public function saveAddress(): void
    {
        $user    = $this->authUser();
        $body    = json_decode(file_get_contents('php://input'), true) ?? [];
        $label   = trim($body['label']   ?? 'Home');
        $address = trim($body['address'] ?? '');
        $city    = trim($body['city']    ?? '');
        $pincode = trim($body['pincode'] ?? '');
        $default = !empty($body['is_default']);

        if (!$address || !$city || !$pincode) {
            sendResponse(false, 'Address, city and pincode are required.');
        }

        if ($default) {
            $this->db->query("UPDATE user_addresses SET is_default = false WHERE user_id = :uid");
            $this->db->update([':uid' => $user['id']]);
        }

        $this->db->query(
            "INSERT INTO user_addresses (user_id, label, address, city, pincode, is_default)
             VALUES (:uid, :label, :address, :city, :pincode, :def)"
        );
        $this->db->create([':uid' => $user['id'], ':label' => $label, ':address' => $address, ':city' => $city, ':pincode' => $pincode, ':def' => $default ? 'true' : 'false']);
        sendResponse(true, 'Address saved.');
    }

    public function deleteAddress(): void
    {
        $user = $this->authUser();
        $id   = (int)($_POST['id'] ?? $_GET['id'] ?? 0);
        if (!$id) {
            sendResponse(false, 'Invalid ID.');
        }
        $this->db->query("UPDATE user_addresses SET is_deleted = true WHERE id = :id AND user_id = :uid");
        $this->db->update([':id' => $id, ':uid' => $user['id']]);
        sendResponse(true, 'Address removed.');
    }
}
