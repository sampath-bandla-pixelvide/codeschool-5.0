<?php

require_once __DIR__ . '/../models/ExitModel.php';
require_once __DIR__ . '/../models/TollRate.php';

class TollService {
    private $exitModel;
    private $tollRateModel;

    public function __construct() {
        $this->exitModel = new ExitModel();
        $this->tollRateModel = new TollRate();
    }

    public function getAllExits() {
        return $this->exitModel->getAll();
    }

    public function addExit($data) {
        return $this->exitModel->create($data);
    }

    public function getAllTollRates() {
        return $this->tollRateModel->getAll();
    }

    public function addTollRate($data) {
        // Check if route already exists
        $exists = $this->tollRateModel->findByRoute($data['entry_exit_id'], $data['destination_exit_id']);
        if ($exists) {
            throw new Exception("Toll rate for this route already exists");
        }
        return $this->tollRateModel->create($data);
    }
}
