<?php

function registerFormValidation($firstName,$lastName,$email,$phone,$dob,$panNumber,$drivingLicense,$password,$confirmPassword){
  $errorArray = [];  
        if (empty($firstName)){
            $errorArray["firstName"] = "FirstName is required";
        }
        else{
            if(strlen($firstName)<3){
                $errorArray["firstName"] = "FirstName Need to be atleast 3 characters";
            }
        }
         if (empty($lastName)){
            $errorArray["lastName"] = "lastName is required";
        }
        else{
            if(strlen($lastName)<3){
                $errorArray["lastName"] = "lastName Need to be atleast 3 characters";
            }
        }
         if (empty($email)){
            $errorArray["email"] = "Email is required";
        }
        else{
            $emailRegex = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';
       if (!preg_match($emailRegex, $email)) {
            $errorArray["email"] = "Email should be in correct format";
        }
        }

         if (empty($dob)){
            $errorArray["dob"] = "dob is required";
        }
        else{
            $today = new DateTime();
            $birthDate = new DateTime($dob);
             $age = $today->diff($birthDate)->y;
            if ($birthDate > $today){
                $errorArray["dob"] = "DOB cannot be in future";
            }
             else {
                if($age<18){
                $errorArray['dob'] = "age need to be greater than 18";
            }
                
        }
    }  
    if (empty($phone)) {
    $errorArray["phone"] = "Phone number is required";
} else {
    if (!preg_match('/^[6-9][0-9]{9}$/', $phone)) {
    $errorArray["phone"] = "Invalid Indian phone number";
}
} 

         if (empty($panNumber)){
            $errorArray["panNumber"] = "panNumber is required";
        }
        else{
            $pattern = "/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/";
            if (!preg_match($pattern, $panNumber)) {
            $errorArray["panNumber"] = "PANnumber should be in correct format,must be capitalized";
        }
    }

    if (empty($drivingLicense)){
        $errorArray["drivingLicense"] = "Driving License is required";
    }
    else{
         $pattern = "/^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/";
            if (!preg_match($pattern, $drivingLicense)) {
            $errorArray["drivingLicense"] = "Driving License should be in correct format";
    }
    }

    if (empty($password)){
            $errorArray["password"] = "password is required to fill";
        }
        else {
            if(strlen($password)<6){
                $errorArray["password"] = "password should be greater than 6 characters";
            }
        }
    

        if($password !== $confirmPassword){
            $errorArray["confirmPassword"] = "password and confirm password need to be same";
        }
return $errorArray;
}
function loginFormValidation($email,$password){
    $errorArray = [];
     if (empty($email)){
            $errorArray["email"] = "Email is required";
        }
        else{
            $emailRegex = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';
       if (!preg_match($emailRegex, $email)) {
            $errorArray["email"] = "Email should be in correct format";
        }
        }
         if (empty($password)){
            $errorArray["password"] = "password is required to fill";
        }
        else {
            if(strlen($password)<3){
                $errorArray["password"] = "password should be greater than 3 characters";
            }
            return $errorArray;
        }
        
}
