<?php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/ExitModel.php';
require_once __DIR__ . '/../models/TollRate.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';
require_once __DIR__ . '/../utils/Validator.php';

class AdminController {
    private $userModel;
    private $exitModel;
    private $tollRateModel;

    public function __construct() {
        $this->userModel = new User();
        $this->exitModel = new ExitModel();
        $this->tollRateModel = new TollRate();
    }

    // Employee Management
    public function getEmployees() {
        $employees = $this->userModel->getAll();
        ResponseHelper::success("Employees retrieved", $employees);
    }

    public function createEmployee() {
        $data = json_decode(file_get_contents("php://input"), true);
        Validator::validate($data, [
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6'
        ]);

        $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        $data['role'] = 'employee';
        $data['assigned_exit_id'] = $data['assigned_exit_id'] ?? null;

        if ($this->userModel->create($data)) {
            ResponseHelper::success("Employee created successfully", null, 201);
        }
        ResponseHelper::error("Failed to create employee");
    }

    public function updateEmployee($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        Validator::validate($data, [
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'required|email',
            'role' => 'required',
            'is_active' => 'required'
        ]);

        $employee = $this->userModel->findById($id);

        if (!$employee) {
            ResponseHelper::error("Employee not found", 404);
        }

        $existingUser = $this->userModel->findByEmail($data['email']);

        if (
            $existingUser &&
            $existingUser['id'] != $id
        ) {
            ResponseHelper::error("Email already exists");
        }
        if (!in_array($data['role'], ['employee'])) {
            ResponseHelper::error("Invalid role");
        }

        $data['assigned_exit_id'] =
            $data['assigned_exit_id'] ?? null;

        $updated = $this->userModel->update($id, $data);

        if ($updated) {

            ResponseHelper::success(
                "Employee updated successfully"
            );
        }

        ResponseHelper::error(
            "Failed to update employee"
        );
    }

    public function deleteEmployee($id)
    {
        $employee = $this->userModel->findById($id);

        if (!$employee) {
            ResponseHelper::error("Employee not found", 404);
        }

        $deleted = $this->userModel->delete($id);

        if ($deleted) {

            ResponseHelper::success(
                "Employee deleted successfully"
            );
        }

        ResponseHelper::error(
            "Failed to delete employee"
        );
    }
    // Exit Management
    public function getExits() {
        $exits = $this->exitModel->getAll();
        ResponseHelper::success("Exits retrieved", $exits);
    }

    public function createExit() {
        $data = json_decode(file_get_contents("php://input"), true);
        Validator::validate($data, [
            'exit_name' => 'required',
            'location' => 'required'
        ]);

        if ($this->exitModel->create($data)) {
            ResponseHelper::success("Exit created successfully", null, 201);
        }
        ResponseHelper::error("Failed to create exit");
    }

        public function updateExit($id)
    {
        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        Validator::validate($data, [
            'exit_name' => 'required',
            'location' => 'required'
        ]);

        $updated = $this->exitModel->update($id, $data);

        if ($updated) {

            ResponseHelper::success(
                "Exit updated successfully"
            );
        }

        ResponseHelper::error(
            "Failed to update exit"
        );
    }

    public function deleteExit($id)
    {
        $deleted = $this->exitModel->delete($id);

        if ($deleted) {

            ResponseHelper::success(
                "Exit deleted successfully"
            );
        }

        ResponseHelper::error(
            "Failed to delete exit"
        );
    }

    // Toll Rate Management
    public function getTollRates() {
        $rates = $this->tollRateModel->getAll();
        ResponseHelper::success("Toll rates retrieved", $rates);
    }

    public function createTollRate() {
        $data = json_decode(file_get_contents("php://input"), true);
        Validator::validate($data, [
            'entry_exit_id' => 'required|numeric',
            'destination_exit_id' => 'required|numeric',
            'amount' => 'required|numeric'
        ]);

        if ($this->tollRateModel->create($data)) {
            ResponseHelper::success("Toll rate created successfully", null, 201);
        }
        ResponseHelper::error("Failed to create toll rate");
    }
    public function updateTollRate($id)
    {
        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        Validator::validate($data, [
            'entry_exit_id' => 'required',
            'destination_exit_id' => 'required',
            'amount' => 'required'
        ]);
        if (
            $data['entry_exit_id'] ==
            $data['destination_exit_id']
        ) {
            return ResponseHelper::error(
                "Entry and destination exits cannot be same"
            );
        }
        $rate = $this->tollRateModel->findById($id);
        if (!$rate) {

            return ResponseHelper::error(
                "Toll rate not found",
                404
            );
        }
        $existingRate =
            $this->tollRateModel->findByRoute(
                $data['entry_exit_id'],
                $data['destination_exit_id']
            );
        if (
            $existingRate &&
            $existingRate['id'] != $id
        ) {
            return ResponseHelper::error(
                "Toll rate already exists for this route"
            );
        }
        $updated =
            $this->tollRateModel->update($id, $data);
        if ($updated) {
            return ResponseHelper::success(
                "Toll rate updated successfully"
            );
        }
        return ResponseHelper::error(
            "Failed to update toll rate"
        );
    }
    public function deleteTollRate($id)
    {
        $rate = $this->tollRateModel->findById($id);
        if (!$rate) {
            return ResponseHelper::error(
                "Toll rate not found",
                404
            );
        }
        $deleted =
            $this->tollRateModel->delete($id);
        if ($deleted) {
            return ResponseHelper::success(
                "Toll rate deleted successfully"
            );
        }
        return ResponseHelper::error(
            "Failed to delete toll rate"
        );
    }
}
