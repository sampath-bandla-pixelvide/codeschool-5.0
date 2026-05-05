<?php
require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";

class UserControllers
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

    public function getUserAddress($token)
    {
        $userId = $this->getUserIdByToken($token);
        if (!$userId) {
            return sendResponse(false, "Invalid Token");
        }
        $addresses = $this->db->query("SELECT CONCAT(u.first_name, ' ', u.last_name) AS customer_name,a.id address_id, concat(address,' ',city,' ',state,' ',country,' ',pin_code) as full_address from users u INNER JOIN customer_address ca ON u.id=ca.customer_id JOIN address a ON ca.address_id=a.id WHERE u.id=:id;")
            ->getAll([":id" => $userId]);
        return sendResponse(true, "Addresses fetched!!",[] , $addresses);
    }
    public function addUserAddress($token, $address, $city, $state, $pincode, $country)
    {
        $userId = $this->getUserIdByToken($token);
        $addressData = $this->db->query("INSERT INTO address (address,city,state,country,pin_code) VALUES (:address,:city,:state,:country,:pin_code) RETURNING id")->get([":address" => $address, ":city" => $city, ":state" => $state, ":country" => $country, ":pin_code" => $pincode]);
        $addressId = $addressData['id'];
        $this->db->query("INSERT INTO customer_address (customer_id,address_id) VALUES (:userId,:addressId)")->execute([":userId" => $userId, ":addressId" => $addressId]);
        return sendResponse(true, "address added");
    }
}
