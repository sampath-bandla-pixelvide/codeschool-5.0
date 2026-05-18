
<?php
require_once __DIR__."/../utils/functions.php";

function registerValidation($data){
    $errorsArray = [];
    $phoneRegex = "/^[6-9][0-9]{9}$/";
    

  
    if (strlen($data['firstName']) < 3) {
        $errorsArray["firstName"] = "first Name should be atleast 3 characters";
    }

   if (strlen($data['lastName']) < 3) {
        $errorsArray["lastName"] = "last Name should be atleast 3 characters";
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errorsArray["email"] = "Enter valid Email";
    }
     if (strlen($data['phone']) != 10 || !is_numeric($data['phone']) || !preg_match($phoneRegex,$data['phone'])) {
        $errorsArray['phone'] = "Invalid phone number!";  
    }

     
    if (strlen($data['password']) < 6 || strlen($data['password']) >= 20) {
        $errorsArray[' password'] = "Invalid Password!password need to be more than 6 characters and less than or equal to 20 characters";
        
    }
    if ($data['password'] !== $data['confirmPassword']) {
        $errorsArray['confirmPassword'] = "Password Mismatch!";
        
    }

    if (!empty($errorsArray)) {
        return sendResponse(false,"Validation Errors",$errorsArray);
    }

}

function loginValidation($email,$password){
      $errorsArray = [];
         if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errorsArray["loginEmail"] = "Enter valid Email";
    }
    if (strlen($password) < 6 || strlen($password) >= 20) {
        $errorsArray['loginPassword'] = "password need to be between 6 characters and 20 characters";  
    }
      if (!empty($errorsArray)) {
        return sendResponse(false,"Validation Errors",$errorsArray);
        }
}

function email($email){
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return sendResponse(false,"invalidEmail");
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
function checkPassword($password,$confirmPassword){
    if (strlen($password) < 6 || strlen($password) >= 20) {
        $errorsArray[' password'] = "Invalid Password!password need to be more than 6 characters and less than or equal to 20 characters";
        
    }
    if ($password !== $confirmPassword) {
        $errorsArray['confirmPassword'] = "Password Mismatch!";
        
    }
}
