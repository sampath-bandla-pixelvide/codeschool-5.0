<?php

require_once __DIR__ . '/../database/db.php';

class ClaimController
{
    private $db;

    public function __construct()
    {
        $this->db = new DB();
    }

    // submit claim
    public function submitClaim($data)
    {
        $item_id = $data['item_id'];
        $claimer_id = $data['claimer_id'];
        $message = trim($data['message']);

        $this->db->query("
        SELECT user_id, is_claimed
        FROM items
        WHERE id = :item_id
    ");

        $item = $this->db->first([
            ":item_id" => $item_id
        ]);

        if (!$item) {
            return [
                "status" => "error",
                "message" => "Item not found"
            ];
        }

        if ($item['is_claimed']) {
            return [
                "status" => "error",
                "message" => "Item already claimed"
            ];
        }

        $owner_id = $item['user_id'];

        if ($owner_id == $claimer_id) {
            return [
                "status" => "error",
                "message" => "You cannot claim your own item"
            ];
        }

        $this->db->query("
        SELECT id
        FROM claims
        WHERE item_id = :item_id
        AND claimer_id = :claimer_id
        AND status='pending'
    ");

        $already = $this->db->first([
            ":item_id" => $item_id,
            ":claimer_id" => $claimer_id
        ]);

        if ($already) {
            return [
                "status" => "error",
                "message" => "Claim already submitted"
            ];
        }

        $this->db->query("
        INSERT INTO claims
        (item_id, claimer_id, owner_id, message, status)
        VALUES
        (:item_id, :claimer_id, :owner_id, :message, 'pending')
    ");

        $this->db->create([
            ":item_id" => $item_id,
            ":claimer_id" => $claimer_id,
            ":owner_id" => $owner_id,
            ":message" => $message
        ]);

        return [
            "status" => "success",
            "message" => "Claim submitted"
        ];
    }


    public function getMyClaims($owner_id)
    {
        $this->db->query("
            SELECT claims.*, users.name
            FROM claims
            JOIN users
            ON claims.claimer_id = users.id
            WHERE claims.owner_id = :owner_id
            ORDER BY claims.id DESC
        ");

        $claims = $this->db->get([
            ":owner_id" => $owner_id
        ]);

        return [
            "status" => "success",
            "claims" => $claims
        ];
    }



    public function updateClaimStatus($data)
    {
        $claim_id = $data['claim_id'];
        $status = $data['status'];

        $this->db->query("
            SELECT item_id
            FROM claims
            WHERE id = :id
        ");

        $claim = $this->db->first([
            ":id" => $claim_id
        ]);

        if (!$claim) {
            return [
                "status" => "error",
                "message" => "Claim not found"
            ];
        }

        $item_id = $claim['item_id'];


        $this->db->query("
            UPDATE claims
            SET status = :status
            WHERE id = :id
        ");

        $this->db->update([
            ":status" => $status,
            ":id" => $claim_id
        ]);

        if ($status == "approved") {

            $this->db->query("
                UPDATE items
                SET is_claimed = true
                WHERE id = :item_id
            ");

            $this->db->update([
                ":item_id" => $item_id
            ]);

            $this->db->query("
                UPDATE claims
                SET status='rejected'
                WHERE item_id = :item_id
                AND id != :claim_id
                AND status='pending'
            ");

            $this->db->update([
                ":item_id" => $item_id,
                ":claim_id" => $claim_id
            ]);
        }

        return [
            "status" => "success",
            "message" => "Updated"
        ];
    }
}
