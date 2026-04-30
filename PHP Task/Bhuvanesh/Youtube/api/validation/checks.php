<?php
 
 function email($email){
     if (empty($email)){
         return  sendResponse(false,"email Empty");
        }
        else{
            $emailRegex = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';
       if (!preg_match($emailRegex, $email)) {
           return sendResponse(false,"email structure incorrect");
        }
        }
 }
    function otp($otp){
        if (empty($otp)){
         return  sendResponse(false,"otp is required to fill");
        }
        else{
       if (strlen($otp)>6|| strlen($otp)<6) {
           return sendResponse(false,"Otp must be 6 characters");
        }
        }
    }
 