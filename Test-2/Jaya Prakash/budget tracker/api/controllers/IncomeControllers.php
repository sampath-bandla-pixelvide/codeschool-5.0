<?php

require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";

class IncomeControllers
{
    private $db = null;

    function __construct()
    {
        $this->db = new DB();
    }

    private function getUserIdByToken($token)
    {
        $userData = $this->db
            ->query("
                SELECT user_id
                FROM user_tokens
                WHERE token = :token
                AND status = true
            ")
            ->get([
                ":token" => $token
            ]);

        return $userData['user_id'];
    }

    public function addIncome($token, $amount, $incomeDate)
    {
        $userId = $this->getUserIdByToken($token);

        if ($amount <= 0) {
            sendResponse(false, "Invalid amount");
        }

        $this->db
            ->query("
            INSERT INTO income (
                user_id,
                amount,
                income_date
            )
            VALUES (
                :user_id,
                :amount,
                :income_date
            )
        ")
            ->execute([
                ":user_id" => $userId,
                ":amount" => $amount,
                ":income_date" => $incomeDate
            ]);

        return sendResponse(true, "Income added successfully");
    }

    public function getIncome($token)
    {
        $userId = $this->getUserIdByToken($token);

        $income = $this->db
            ->query("SELECT id,amount,income_date
                        FROM income
                        WHERE user_id = :user_id
                        AND status = true
                        ORDER BY income_date DESC
                    ")
            ->getAll([
                ":user_id" => $userId
            ]);

        return sendResponse(true, "Income fetched successfully", $income);
    }

    public function deleteIncome($token, $id)
    {
        $userId = $this->getUserIdByToken($token);

        $income = $this->db
            ->query("SELECT id FROM income WHERE id = :id AND user_id = :user_id AND status = true")
            ->get([
                ":id" => $id,
                ":user_id" => $userId
            ]);

        if (!$income) {
            return sendResponse(false,"Income not found");
        }

        $this->db->query("UPDATE income SET status = false WHERE id = :id")->execute([":id" => $id]);
        return sendResponse(true, "Income deleted successfully");
    }
}
