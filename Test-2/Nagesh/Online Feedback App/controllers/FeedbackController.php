<?php

require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../config/helperFunction.php";

class FeedbackController
{
    private $db;

    public function __construct()
    {
        $this->db = new DB();
    }

    public function addFeedback(
        $productId,
        $userId,
        $feedback,
        $rating
    )
    {

        $query = "
        SELECT *
        FROM products
        WHERE id = :id
        AND feedback_end_time > CURRENT_TIMESTAMP
        ";

        $this->db->query($query);

        $product = $this->db->first([
            ':id' => $productId
        ]);

        if(!$product){

            sendResponse(
                false,
                "Feedback Time Expired"
            );
        }

        $insertQuery = "
        INSERT INTO feedbacks
        (
            product_id,
            user_id,
            feedback,
            rating
        )
        VALUES
        (
            :productId,
            :userId,
            :feedback,
            :rating
        )
        ";

        $this->db->query($insertQuery);

        $status = $this->db->create([
            ':productId' => $productId,
            ':userId' => $userId,
            ':feedback' => $feedback,
            ':rating' => $rating
        ]);

        if($status){

            sendResponse(
                true,
                "Feedback Added Successfully"
            );
        }

        sendResponse(false, "Failed");
    }

    public function getFeedbacks($productId, $userId)
    {
        // Check if user is admin
        $this->db->query("SELECT role FROM users WHERE id = :id");
        $user = $this->db->first([':id' => $userId]);
        
        if ($user && $user['role'] === 'admin') {
            $query = "
            SELECT
            f.*,
            u.first_name, u.avatar
            FROM feedbacks f
            JOIN users u
            ON u.id = f.user_id
            WHERE product_id = :id
            ORDER BY f.id DESC
            ";
            $this->db->query($query);
            $feedbacks = $this->db->get([':id' => $productId]);
        } else {
            $query = "
            SELECT
            f.*,
            u.first_name, u.avatar
            FROM feedbacks f
            JOIN users u
            ON u.id = f.user_id
            WHERE product_id = :id AND f.user_id = :user_id
            ORDER BY f.id DESC
            ";
            $this->db->query($query);
            $feedbacks = $this->db->get([':id' => $productId, ':user_id' => $userId]);
        }

        sendResponse(
            true,
            "Feedbacks fetched",
            $feedbacks
        );
    }

    public function getAllFeedbacks($userId)
    {
        $this->db->query("SELECT role FROM users WHERE id = :id");
        $user = $this->db->first([':id' => $userId]);
        
        if ($user && $user['role'] === 'admin') {
            $query = "
            SELECT
            f.*,
            p.title as product_title,
            u.first_name, u.avatar
            FROM feedbacks f
            JOIN users u ON u.id = f.user_id
            JOIN products p ON p.id = f.product_id
            ORDER BY f.id DESC
            ";
            $this->db->query($query);
            $feedbacks = $this->db->get();
        } else {
            $query = "
            SELECT
            f.*,
            p.title as product_title,
            u.first_name, u.avatar
            FROM feedbacks f
            JOIN users u ON u.id = f.user_id
            JOIN products p ON p.id = f.product_id
            WHERE f.user_id = :user_id
            ORDER BY f.id DESC
            ";
            $this->db->query($query);
            $feedbacks = $this->db->get([':user_id' => $userId]);
        }

        sendResponse(
            true,
            "All feedbacks fetched",
            $feedbacks
        );
    }
}