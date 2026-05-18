<?php

require_once __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";

class addressController {

    private $db = null;

    function __construct() {
        $this->db = new DB();
    }

    public function createAddress($user_id, $address_line, $city, $state, $country, $pincode) {

        $query = "
            INSERT INTO user_addresses
            (user_id, address_line, city, state, country, pincode)
            VALUES
            (:user_id, :address_line, :city, :state, :country, :pincode)
        ";

        $this->db->query($query);

        $result = $this->db->create([
            'user_id' => $user_id,
            'address_line' => $address_line,
            'city' => $city,
            'state' => $state,
            'country' => $country,
            'pincode' => $pincode
        ]);

        if (!$result) {
            sendResponse(false, "Address not saved");
            exit;
        }

        sendResponse(true, "Address added successfully");
    }

    public function getAddresses($user_id) {

        $query = "
            SELECT *
            FROM user_addresses
            WHERE user_id = :user_id
            ORDER BY id DESC
        ";

        $this->db->query($query);

        return $this->db->get([
            'user_id' => $user_id
        ]);
    }

    public function updateAddress($id, $address_line, $city, $state, $country, $pincode) {

        $query = "
            UPDATE user_addresses
            SET 
                address_line = :address_line,
                city = :city,
                state = :state,
                country = :country,
                pincode = :pincode
            WHERE id = :id
        ";

        $this->db->query($query);

        $result = $this->db->update([
            'id' => $id,
            'address_line' => $address_line,
            'city' => $city,
            'state' => $state,
            'country' => $country,
            'pincode' => $pincode
        ]);

        if (!$result) {
            sendResponse(false, "Update failed");
            exit;
        }

        sendResponse(true, "Address updated");
    }

    public function deleteAddress($id) {

        $query = "DELETE FROM user_addresses WHERE id = :id";

        $this->db->query($query);

        $result = $this->db->delete([
            'id' => $id
        ]);

        if (!$result) {
            sendResponse(false, "Delete failed");
            exit;
        }

        sendResponse(true, "Address deleted");
    }
}