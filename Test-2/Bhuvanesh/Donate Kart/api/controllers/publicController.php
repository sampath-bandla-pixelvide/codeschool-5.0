<?php

require __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";

class publicController
{
    private $db = NULL;

    function __construct()
    {
        $this->db = new DB();
    }

    function getCampaigns()
    {
        $selectQuery = "SELECT c.*, COALESCE(SUM(d.amount), 0) as total_donations FROM campaigns c LEFT JOIN donations d ON c.id = d.campaign_id GROUP BY c.id ORDER BY c.created_at DESC";
        $selectStatus = $this->db->query($selectQuery)->get();
        if ($selectStatus === false) {
            return sendResponse(false, "Something went wrong");
        }
        if (empty($selectStatus)) {
            return sendResponse(true, "No Campaigns found", []);
        }
        return sendResponse(true, "success", $selectStatus);
    }

    function getCampaignDetails($id)
    {
        $selectQuery = "SELECT c.*, COALESCE(SUM(d.amount), 0) as total_donations FROM campaigns c LEFT JOIN donations d ON c.id = d.campaign_id WHERE c.id = :id GROUP BY c.id";
        $campaign = $this->db->query($selectQuery)->first([":id" => $id]);
        if (!$campaign) {
            return sendResponse(false, "Campaign not found");
        }

        $donationsQuery = "SELECT donor_name, amount, donated_at FROM donations WHERE campaign_id = :id ORDER BY donated_at DESC";
        $donations = $this->db->query($donationsQuery)->get([":id" => $id]);

        $campaign['donations'] = $donations ? $donations : [];

        return sendResponse(true, "success", $campaign);
    }

    function submitDonation($data)
    {
        if (empty($data['campaign_id']) || empty($data['donor_name']) || empty($data['mobile']) || empty($data['amount']) || empty($data['payment_method']) || empty($data['payment_id'])) {
            return sendResponse(false, "All fields are required");
        }

        $insertQuery = "INSERT INTO donations (campaign_id, donor_name, mobile, amount, payment_method, payment_id) VALUES (:campaign_id, :donor_name, :mobile, :amount, :payment_method, :payment_id)";
        $insertStatus = $this->db->query($insertQuery)->create([
            ":campaign_id" => $data['campaign_id'],
            ":donor_name" => $data['donor_name'],
            ":mobile" => $data['mobile'],
            ":amount" => $data['amount'],
            ":payment_method" => $data['payment_method'],
            ":payment_id" => $data['payment_id']
        ]);

        if (!$insertStatus) {
            return sendResponse(false, "Donation Failed! Try again later");
        }

        return sendResponse(true, "Thank you for your donation!");
    }
}
