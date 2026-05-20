<?php

require_once __DIR__ . '/../services/TripService.php';
require_once __DIR__ . '/../models/Trip.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';
require_once __DIR__ . '/../utils/Validator.php';

class TripController {
    private $tripService;
    private $tripModel;

    public function __construct() {
        $this->tripService = new TripService();
        $this->tripModel = new Trip();
    }

    public function entry($user) {
        $data = json_decode(file_get_contents("php://input"), true);
        Validator::validate($data, [
            'vehicle_number' => 'required',
            'entry_exit_id' => 'required|numeric'
        ]);

        try {
            $trip = $this->tripService->registerEntry($data, $user['user_id']);
            ResponseHelper::success("Trip entry registered successfully", $trip, 201);
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage());
        }
    }

    public function exit($user) {
        $data = json_decode(file_get_contents("php://input"), true);
        Validator::validate($data, [
            'token_number' => 'required',
            'exit_exit_id' => 'required|numeric',
            'payment_method' => 'required'
        ]);

        try {
            $trip = $this->tripService->processExit($data, $user['user_id']);
            ResponseHelper::success("Trip completed successfully", $trip);
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage());
        }
    }

    public function getActiveTrips() {
        $trips = $this->tripModel->getActiveTrips();
        ResponseHelper::success("Active trips retrieved", $trips);
    }

    public function getTripByToken($token) {
        $trip = $this->tripModel->findByToken($token);
        if ($trip) {
            ResponseHelper::success("Trip retrieved", $trip);
        }
        ResponseHelper::error("Trip not found", 404);
    }

    // Reports
    public function getDailyReport() {
        $date = $_GET['date'] ?? date('Y-m-d');
        $report = $this->tripModel->getDailyReport($date);
        ResponseHelper::success("Daily report for $date", $report);
    }

    public function getEmployeeCollections() {
        $collections = $this->tripModel->getEmployeeCollections();
        ResponseHelper::success("Employee collections retrieved", $collections);
    }
}
