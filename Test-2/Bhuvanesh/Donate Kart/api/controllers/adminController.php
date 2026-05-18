<?php

require __DIR__ . "/../utils/db.php";
require_once __DIR__ . "/../utils/functions.php";

class adminController{
    private $db = NULL;

    function __construct(){
        $this->db = new DB();
    }
    function tokenCheck($token){
        $ValidUser = $this->db->query("SELECT u.role, u.id from users u inner join user_tokens ut on u.id = ut.user_id where ut.token = :token AND ut.status = true AND ut.expires_at > CURRENT_TIMESTAMP ")->first([":token" => $token]);        
        if (!$ValidUser) {
            sendResponse(false, "Expired Token!!");
        }
        $isAdmin = false;
        if (strtoupper($ValidUser['role']) === "ADMIN") {
            $isAdmin = true;
        }
        $ValidUser['isAdmin'] = $isAdmin;
        return $ValidUser;
    }
    function addCampaign($token,$data){
        $user = $this->tokenCheck($token);
        if(empty($user) || !$user['isAdmin']){
            return sendResponse(false,"Unauthorized! Admin only.");
        }
        $insertQuery = "INSERT INTO campaigns (title, target_amount, description) VALUES (:title, :target_amount, :description)";
        $insertStatus = $this->db->query($insertQuery)->create([
            ":title" => $data['title'],
            ":target_amount" => $data['target_amount'],
            ":description" => $data['description']
        ]);
        if(!$insertStatus){
            return sendResponse(false,"initiation failed! try again later");
        }
        return sendResponse(true,"insertion successful");
    }

    function selectCampaign($token){
        $user = $this->tokenCheck($token);
        if(empty($user) || !$user['isAdmin']){
            return sendResponse(false,"Unauthorized! Admin only.");
        }
        $selectQuery = "SELECT c.*, COALESCE(SUM(d.amount), 0) as total_donations FROM campaigns c LEFT JOIN donations d ON c.id = d.campaign_id GROUP BY c.id ORDER BY c.created_at DESC";
        $selectStatus = $this->db->query($selectQuery)->get();
        if($selectStatus === false){
            return sendResponse(false,"Something went wrong");
        }
        if(empty($selectStatus)){
            return sendResponse(true,"NO Campaign at!!", []);
        }
        return sendResponse(true,"success", $selectStatus);
    }
}


