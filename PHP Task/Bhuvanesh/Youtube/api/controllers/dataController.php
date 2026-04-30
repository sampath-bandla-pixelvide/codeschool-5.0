<?php
require __DIR__ . "/../utils/db.php";
require __DIR__ . "/../utils/function.php";

class dataController
{
    private $db = NULL;
    function __construct()
    {
        $this->db = new DB();
    }
    function default(){
        $selectQuery = "SELECT * from videos";
        $videosDetails =  $this->db->query($selectQuery)->get();
        if($videosDetails === false){
            sendResponse(false,"DatabaseError");
        }
        sendResponse(true,"success",$videosDetails);
    }
    function search($search){
        if(empty($search)){
            return sendResponse(false,"Nothing Changed");
        }
        else{
        $searchParam = "%" . $search . "%";
        $selectQuery = "SELECT * FROM videos v INNER JOIN video_categories vc ON v.id = vc.video_id INNER JOIN categories c ON vc.category_id = c.id WHERE v.title LIKE :search OR v.description LIKE :search OR c.name LIKE :search";
   $videosDetails =  $this->db->query($selectQuery)->get([":search"=>$searchParam]);
     if($videosDetails === false){
        return sendResponse(false,"DatabaseError");
    }

    if(empty($videosDetails)){
        return sendResponse(true,"No results found",[]);
    }

    sendResponse(true,"success",$videosDetails);
}
        }
}
