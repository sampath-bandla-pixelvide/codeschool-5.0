<?php
require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";

class categoryControllers
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

    public function addCategory($token, $name)
    {
        $userId = $this->getUserIdByToken($token);
        if (!$userId) {
            return sendResponse(false, "Unauthorized user!!");
        }
        $categoryExist = $this->db->query("SELECT 1 FROM categories WHERE name=:name AND user_id=:id AND status=true")->get([":name" => $name, ":id" => $userId]);
        if ($categoryExist) {
            return sendResponse(false, "Category Already Exists!");
        }
        $this->db->query("INSERT INTO categories (name,user_id) VALUES (:name,:id)")->execute([":name" => $name, ":id" => $userId]);
        return sendResponse(true, "Category added successfully");
    }

    public function getCategories($token)
    {
        $userId = $this->getUserIdByToken($token);
        if (!$userId) {
            return sendResponse(false, "Session Expired");
        }
        $data = $this->db->query("SELECT id,name FROM categories WHERE status = true AND user_id=:id")->getAll([":id" => $userId]);
        return sendResponse(true, "Categories fetched", $data);
    }


    public function deleteCategory($id, $token)
    {
        $userId = $this->getUserIdByToken($token);
        if (!$userId) {
            return sendResponse(false, "Session Expired");
        }
        $this->db->query("UPDATE categories SET status=false WHERE id=:id AND user_id=:user_id")->execute([":id" => $id, ":user_id" => $userId]);
        return sendResponse(true, "Category Deleted!!");
    }
}
