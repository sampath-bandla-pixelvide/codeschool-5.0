<?php

require_once __DIR__ . "/Controllers/AdminController.php";

$appointment_id =
    $_POST["appointment_id"] ?? "";

$adminController =
    new AdminController();

echo $adminController
    ->cancelAppointment(
        $appointment_id
    );