<?php
require_once __DIR__ . '/../utils/pdo.php';
require_once __DIR__ . '/../utils/db.php';
require_once __DIR__ . '/../utils/functions.php';

class AdminController
{
    private DB $db;

    public function __construct()
    {
        $this->db = new DB();
        $this->adminOnly();
    }

    private function adminOnly(): void
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
        if (!$user || $user['role'] !== 'admin') {
            sendResponse(false, 'Forbidden: Admins only');
            exit;
        }
    }

    private function pgBool(mixed $v): int
    {
        return in_array($v, ['t', 'true', '1', true, 1], true) ? 1 : 0;
    }

    public function getStats(): void
    {
        $this->db->query("SELECT COUNT(*) as cnt FROM users");
        $users = $this->db->first([])['cnt'];
        $this->db->query("SELECT COUNT(*) as cnt FROM food_categories WHERE is_active = TRUE");
        $cats  = $this->db->first([])['cnt'];
        $this->db->query("SELECT COUNT(*) as cnt FROM food_items WHERE is_available = TRUE");
        $items = $this->db->first([])['cnt'];
        $this->db->query("SELECT COUNT(*) as cnt FROM orders");
        $orders = $this->db->first([])['cnt'];
        sendResponse(true, 'Stats loaded', [
            'users'      => (int)$users,
            'categories' => (int)$cats,
            'food_items' => (int)$items,
            'orders'     => (int)$orders,
        ]);
    }

    public function getUsers(): void
    {
        $this->db->query("SELECT id, name, email, mobile, role, is_active, created_at FROM users ORDER BY created_at DESC");
        sendResponse(true, 'OK', $this->db->rows([]));
    }

    public function getCategories(): void
    {
        $this->db->query("SELECT id, name, is_active, created_at FROM food_categories ORDER BY created_at DESC");
        $cats = $this->db->rows([]);
        foreach ($cats as &$cat) {
            $cat['is_active'] = $this->pgBool($cat['is_active']);
            try {
                $this->db->query("SELECT photo_url FROM category_photos WHERE category_id = :id ORDER BY id ASC");
                $photoRows     = $this->db->rows([':id' => $cat['id']]);
                $cat['photos'] = array_column($photoRows, 'photo_url');
            } catch (Exception) {
                $cat['photos'] = [];
            }
        }
        unset($cat);
        sendResponse(true, 'OK', $cats);
    }

    public function saveCategory(): void
    {
        $id     = (int)($_POST['id'] ?? 0);
        $name   = trim($_POST['name'] ?? '');
        $active = isset($_POST['is_active']) ? (int)$_POST['is_active'] : 1;

        if (empty($name)) {
            sendResponse(false, 'Name is required');
        }

        if ($id) {
            $this->db->query("UPDATE food_categories SET name = :name, is_active = :active WHERE id = :id");
            $this->db->update([':name' => $name, ':active' => $active ? 'true' : 'false', ':id' => $id]);
            $catId = $id;
        } else {
            $this->db->query("INSERT INTO food_categories (name, is_active) VALUES (:name, :active) RETURNING id");
            $row   = $this->db->first([':name' => $name, ':active' => $active ? 'true' : 'false']);
            $catId = (int)($row['id'] ?? 0);
            if (!$catId) {
                sendResponse(false, 'Failed to create category');
            }
        }

        $photoErrors = [];
        if (!empty($_FILES['photos']['name'][0])) {
            $uploadDir = __DIR__ . '/../../images/categories/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            if (!is_writable($uploadDir)) {
                sendResponse(false, 'Upload directory not writable: ' . $uploadDir);
            }

            $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            $maxSize = 2 * 1024 * 1024;
            foreach ($_FILES['photos']['name'] as $i => $origName) {
                $error = $_FILES['photos']['error'][$i];
                $tmp   = $_FILES['photos']['tmp_name'][$i];
                if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE) {
                    $photoErrors[] = "'$origName' exceeds the 2MB upload limit";
                    continue;
                }
                if ($error !== UPLOAD_ERR_OK) {
                    $photoErrors[] = "'$origName' failed to upload (error $error)";
                    continue;
                }
                if (!is_uploaded_file($tmp)) {
                    $photoErrors[] = "'$origName' is not a valid upload";
                    continue;
                }
                if ($_FILES['photos']['size'][$i] > $maxSize) {
                    $photoErrors[] = "'$origName' exceeds the 2MB upload limit";
                    continue;
                }
                $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
                if (!in_array($ext, $allowed)) {
                    $photoErrors[] = "'$origName': invalid file type .$ext";
                    continue;
                }
                $filename = 'cat_' . $catId . '_' . time() . '_' . $i . '.' . $ext;
                $dest     = $uploadDir . $filename;
                if (move_uploaded_file($tmp, $dest)) {
                    try {
                        $this->db->query("INSERT INTO category_photos (category_id, photo_url) VALUES (:cat_id, :url)");
                        $this->db->create([':cat_id' => $catId, ':url' => 'images/categories/' . $filename]);
                    } catch (Exception $e) {
                        $photoErrors[] = 'DB error: ' . $e->getMessage();
                    }
                } else {
                    $photoErrors[] = "Failed to save '$origName'";
                }
            }
        }

        $msg = $id ? 'Category updated' : 'Category added';
        if ($photoErrors) {
            $msg .= ' (photo issues: ' . implode('; ', $photoErrors) . ')';
        }
        sendResponse(true, $msg);
    }

    public function deleteCategory(): void
    {
        $id = (int)($_POST['id'] ?? $_GET['id'] ?? 0);
        if (!$id) {
            sendResponse(false, 'Invalid ID');
        }
        try {
            $this->db->query("DELETE FROM category_photos WHERE category_id = :id");
            $this->db->update([':id' => $id]);
        } catch (Exception) {
        }
        $this->db->query("DELETE FROM food_categories WHERE id = :id");
        $this->db->update([':id' => $id]);
        sendResponse(true, 'Category deleted');
    }

    public function getFoodItems(): void
    {
        $this->db->query(
            "SELECT fi.*, fc.name AS category_name
             FROM food_items fi
             LEFT JOIN food_categories fc ON fi.category_id = fc.id
             ORDER BY fi.created_at DESC"
        );
        $items = $this->db->rows([]);
        foreach ($items as &$item) {
            $this->db->query("SELECT photo_url FROM food_photos WHERE food_id = :id ORDER BY is_primary DESC, id ASC");
            $photos            = $this->db->rows([':id' => $item['id']]);
            $item['photos']    = array_column($photos, 'photo_url');
            $item['photo_count'] = count($item['photos']);
        }
        unset($item);
        sendResponse(true, 'OK', $items);
    }

    public function addFoodItem(): void
    {
        $name  = trim($_POST['name']          ?? '');
        $desc  = trim($_POST['description']   ?? '');
        $price = (float)($_POST['price']      ?? 0);
        $catId = (int)($_POST['category_id']  ?? 0);
        $avail = isset($_POST['is_available']) ? (int)$_POST['is_available'] : 1;
        $isVeg = isset($_POST['is_veg'])       ? (int)$_POST['is_veg']       : 1;

        if (empty($name) || $price <= 0 || !$catId) {
            sendResponse(false, 'Name, price and category are required');
        }

        $this->db->query(
            "INSERT INTO food_items (category_id, name, description, price, is_available, is_veg)
             VALUES (:cat, :name, :desc, :price, :avail, :veg) RETURNING id"
        );
        $row    = $this->db->first([':cat' => $catId, ':name' => $name, ':desc' => $desc, ':price' => $price, ':avail' => $avail, ':veg' => $isVeg ? 'true' : 'false']);
        $itemId = (int)($row['id'] ?? 0);
        if (!$itemId) {
            sendResponse(false, 'Failed to save food item');
        }

        if (!empty($_FILES['photos']['name'][0])) {
            $uploadDir = __DIR__ . '/../../images/food/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $maxSize   = 2 * 1024 * 1024;
            $allowed   = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            $isPrimary = true;
            $uploadErrors = [];
            foreach ($_FILES['photos']['name'] as $i => $origName) {
                $error = $_FILES['photos']['error'][$i];
                $tmp   = $_FILES['photos']['tmp_name'][$i];
                if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE) {
                    $uploadErrors[] = "'$origName' exceeds the 2MB upload limit";
                    continue;
                }
                if ($error !== UPLOAD_ERR_OK) {
                    $uploadErrors[] = "'$origName' failed to upload (error $error)";
                    continue;
                }
                if (!is_uploaded_file($tmp)) continue;
                if ($_FILES['photos']['size'][$i] > $maxSize) {
                    $uploadErrors[] = "'$origName' exceeds the 2MB upload limit";
                    continue;
                }
                $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
                if (!in_array($ext, $allowed)) {
                    $uploadErrors[] = "'$origName': invalid file type .$ext";
                    continue;
                }
                $filename = 'food_' . $itemId . '_' . time() . '_' . $i . '.' . $ext;
                if (move_uploaded_file($tmp, $uploadDir . $filename)) {
                    $this->db->query("INSERT INTO food_photos (food_id, photo_url, is_primary) VALUES (:fid, :url, :pri)");
                    $this->db->create([':fid' => $itemId, ':url' => 'images/food/' . $filename, ':pri' => $isPrimary ? 'true' : 'false']);
                    $isPrimary = false;
                }
            }
            if ($uploadErrors) {
                sendResponse(true, 'Food item added, but some photos were skipped: ' . implode('; ', $uploadErrors));
            }
        }
        sendResponse(true, 'Food item added successfully');
    }

    public function updateFoodItem(): void
    {
        $id    = (int)($_POST['id']           ?? 0);
        $name  = trim($_POST['name']          ?? '');
        $desc  = trim($_POST['description']   ?? '');
        $price = (float)($_POST['price']      ?? 0);
        $catId = (int)($_POST['category_id']  ?? 0);
        $avail = isset($_POST['is_available']) ? (int)$_POST['is_available'] : 0;
        $isVeg = isset($_POST['is_veg'])       ? (int)$_POST['is_veg']       : 1;

        if (!$id || empty($name) || $price <= 0 || !$catId) {
            sendResponse(false, 'Invalid data');
        }

        $this->db->query(
            "UPDATE food_items
             SET name=:name, description=:desc, price=:price,
                 category_id=:cat, is_available=:avail, is_veg=:veg
             WHERE id=:id"
        );
        $this->db->update([':name' => $name, ':desc' => $desc, ':price' => $price, ':cat' => $catId, ':avail' => $avail ? 'true' : 'false', ':veg' => $isVeg ? 'true' : 'false', ':id' => $id]);
        sendResponse(true, 'Food item updated');
    }

    public function deleteFoodItem(): void
    {
        $id = (int)($_POST['id'] ?? $_GET['id'] ?? 0);
        if (!$id) {
            sendResponse(false, 'Invalid ID');
        }
        $this->db->query("DELETE FROM food_photos WHERE food_id = :id");
        $this->db->update([':id' => $id]);
        $this->db->query("DELETE FROM food_items WHERE id = :id");
        $this->db->update([':id' => $id]);
        sendResponse(true, 'Food item deleted');
    }

    public function getOrders(): void
    {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $this->db->query(
            "SELECT o.id, o.user_id, o.delivery_name, o.delivery_mobile,
                    o.subtotal, o.delivery_charge, o.total_amount,
                    o.status, o.notes, o.created_at,
                    u.name AS user_name,
                    ua.address AS delivery_address, ua.city AS delivery_city, ua.pincode AS delivery_pincode,
                    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
                    p.method AS payment_method, p.status AS payment_status, p.utr_reference, p.id AS payment_id
             FROM orders o
             LEFT JOIN users u  ON o.user_id  = u.id
             LEFT JOIN user_addresses ua ON o.address_id = ua.id
             LEFT JOIN payments p ON p.order_id = o.id
             ORDER BY o.created_at DESC
             LIMIT :lim"
        );
        sendResponse(true, 'OK', $this->db->rows([':lim' => $limit]));
    }

    public function updateOrderStatus(): void
    {
        $id      = (int)($_POST['id'] ?? 0);
        $status  = trim($_POST['status'] ?? '');
        $allowed = ['placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!$id || !in_array($status, $allowed)) {
            sendResponse(false, 'Invalid data');
        }
        $this->db->query("UPDATE orders SET status = :status WHERE id = :id");
        $this->db->update([':status' => $status, ':id' => $id]);
        sendResponse(true, 'Order status updated');
    }

    public function updatePaymentStatus(): void
    {
        $paymentId = (int)($_POST['payment_id'] ?? 0);
        $status    = trim($_POST['status'] ?? '');
        $allowed   = ['pending', 'success', 'failed', 'refunded'];
        if (!$paymentId || !in_array($status, $allowed)) {
            sendResponse(false, 'Invalid data');
        }
        $paidAt = $status === 'success' ? 'NOW()' : 'NULL';
        $this->db->query("UPDATE payments SET status = :status, paid_at = $paidAt WHERE id = :id");
        $this->db->update([':status' => $status, ':id' => $paymentId]);
        sendResponse(true, 'Payment status updated');
    }

    public function getSettings(): void
    {
        $this->db->query("SELECT key, value FROM site_settings");
        $rows = $this->db->rows([]);
        $out  = [];
        foreach ($rows as $r) {
            $out[$r['key']] = $r['value'];
        }
        sendResponse(true, 'OK', $out);
    }

    public function updateSettings(): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach ($body as $key => $value) {
            $this->db->query(
                "INSERT INTO site_settings (key, value) VALUES (:key, :val)
                 ON CONFLICT (key) DO UPDATE SET value = :val2, updated_at = NOW()"
            );
            $this->db->create([':key' => $key, ':val' => (string)$value, ':val2' => (string)$value]);
        }
        sendResponse(true, 'Settings saved.');
    }

    public function toggleCategoryStatus(): void
    {
        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $id     = (int)($body['id'] ?? 0);
        $active = !empty($body['is_active']) ? 'true' : 'false';
        if (!$id) {
            sendResponse(false, 'Invalid ID');
        }
        $this->db->query("UPDATE food_categories SET is_active = :active WHERE id = :id");
        $this->db->update([':active' => $active, ':id' => $id]);
        sendResponse(true, 'Category status updated');
    }

    public function toggleFoodStatus(): void
    {
        $body  = json_decode(file_get_contents('php://input'), true) ?? [];
        $id    = (int)($body['id'] ?? 0);
        $avail = !empty($body['is_available']) ? 'true' : 'false';
        if (!$id) {
            sendResponse(false, 'Invalid ID');
        }
        $this->db->query("UPDATE food_items SET is_available = :avail WHERE id = :id");
        $this->db->update([':avail' => $avail, ':id' => $id]);
        sendResponse(true, 'Food status updated');
    }

    public function getFoodByCategory(): void
    {
        $catId = (int)($_GET['category_id'] ?? 0);
        if (!$catId) {
            sendResponse(false, 'Category required');
        }
        $this->db->query(
            "SELECT fi.id, fi.name, fi.is_available, fi.is_veg, fi.price
             FROM food_items fi WHERE fi.category_id = :cid ORDER BY fi.name ASC"
        );
        $items = $this->db->rows([':cid' => $catId]);
        foreach ($items as &$item) {
            $item['is_available'] = in_array($item['is_available'], ['t', 'true', '1', true, 1], true) ? 1 : 0;
            $item['is_veg']       = in_array($item['is_veg'],       ['t', 'true', '1', true, 1], true) ? 1 : 0;
        }
        unset($item);
        sendResponse(true, 'OK', $items);
    }
}
