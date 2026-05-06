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

 function password($password){
     if (empty($password)){
         return  sendResponse(false,"password Empty");
        }
        else{
             $passwordRegex =
      '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{5,20}$/';
       if (!preg_match($passwordRegex, $password)) {
           return sendResponse(false,"password structure incorrect");
        }
 }
    
 }
 