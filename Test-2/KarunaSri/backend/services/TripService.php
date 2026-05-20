<?php

require_once __DIR__ . '/../models/Trip.php';
require_once __DIR__ . '/../models/TollRate.php';
require_once __DIR__ . '/../models/Payment.php';
require_once __DIR__ . '/../helpers/TokenHelper.php';

class TripService {
    private $tripModel;
    private $tollRateModel;
    private $paymentModel;

    public function __construct() {
        $this->tripModel = new Trip();
        $this->tollRateModel = new TollRate();
        $this->paymentModel = new Payment();
    }

    public function registerEntry($data, $employeeId) {
        // 1. Check if vehicle already has an active trip
        $activeTrip = $this->tripModel->findActiveByVehicle($data['vehicle_number']);
        if ($activeTrip) {
            throw new Exception("Vehicle already has an active trip: " . $activeTrip['token_number']);
        }

        // 2. Generate unique token
        $token = TokenHelper::generateTripToken();

        // 3. Prepare data
        $tripData = [
            'token_number' => $token,
            'vehicle_number' => $data['vehicle_number'],
            'entry_exit_id' => $data['entry_exit_id'],
            'created_by_employee_id' => $employeeId
        ];

        // 4. Create trip
        if ($this->tripModel->create($tripData)) {
            return $this->tripModel->findByToken($token);
        }

        throw new Exception("Failed to create trip record");
    }

    public function processExit($data, $employeeId) {
        // 1. Find active trip by token
        $trip = $this->tripModel->findByToken($data['token_number']);
        if (!$trip || $trip['status'] !== 'active') {
            throw new Exception("No active trip found for token: " . $data['token_number']);
        }

        // 2. Calculate toll amount
        $tollRate = $this->tollRateModel->findByRoute($trip['entry_exit_id'], $data['exit_exit_id']);
        if (!$tollRate) {
            throw new Exception("Toll rate not defined for this route");
        }

        // 3. Complete trip and store payment
        $updateData = [
            'exit_exit_id' => $data['exit_exit_id'],
            'amount' => $tollRate['amount'],
            'payment_method' => $data['payment_method'],
            'closed_by_employee_id' => $employeeId
        ];

        if ($this->tripModel->complete($trip['id'], $updateData)) {
            // Also store in payments table
            $this->paymentModel->create([
                'trip_id' => $trip['id'],
                'amount' => $tollRate['amount'],
                'payment_method' => $data['payment_method'],
                'collected_by_employee_id' => $employeeId
            ]);
            return $this->tripModel->findByToken($data['token_number']);
        }

        throw new Exception("Failed to process vehicle exit");
    }
}
