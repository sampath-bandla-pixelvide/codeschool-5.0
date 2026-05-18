<?php
require_once __DIR__ . "/../db/db.php";
require_once __DIR__ . "/../utils/functions.php";

class ExpensesControllers
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

    public function getMonths($token)
    {
        $userId = $this->getUserIdByToken($token);

        $months = $this->db
            ->query("
                SELECT DISTINCT
                TO_CHAR(income_date, 'YYYY-MM') AS month
                FROM income
                WHERE
                    user_id = :user_id
                ORDER BY month DESC;
            ")
            ->getAll([
                ":user_id" => $userId
            ]);

        return sendResponse(
            true,
            "Months fetched!!",
            $months
        );
    }

    public function addExpense($token, $categoryId, $title, $description, $amountSpent, $spentDate)
    {
        $userId = $this->getUserIdByToken($token);

        if (!$userId) {
            return sendResponse(false, "Unauthorized User!!");
        }
        $this->db
            ->query("INSERT INTO expenses (user_id, category_id, title, description, amount_spent, spent_date) VALUES (:user_id, :category_id, :title, :description, :amount_spent, :spent_date)")
            ->execute([
                ":user_id" => $userId,
                ":category_id" => $categoryId,
                ":title" => $title,
                ":description" => $description,
                ":amount_spent" => $amountSpent,
                ":spent_date" => $spentDate
            ]);
        return sendResponse(true, "Expense added successfully");
    }

    public function getExpenses($token, $month = null, $categoryId = null)
    {
        $userId = $this->getUserIdByToken($token);

        $query = "SELECT expenses.id, expenses.title, expenses.description, expenses.amount_spent, expenses.spent_date, categories.name AS category_name FROM expenses INNER JOIN categories ON categories.id = expenses.category_id WHERE expenses.user_id = :user_id";

        $params = [
            ":user_id" => $userId
        ];

        if ($month && $month != "All" && $month != "0") {
            $query .= " AND TO_CHAR(expenses.spent_date, 'YYYY-MM') = :month";
            $params[":month"] = $month;
        }

        if ($categoryId && $categoryId != "All") {
            $query .= " AND expenses.category_id = :category_id";
            $params[":category_id"] = $categoryId;
        }

        $query .= " AND expenses.status=true ORDER BY expenses.spent_date DESC";
        $expenses = $this->db
            ->query($query)
            ->getAll($params);

        return sendResponse(true, "Expenses fetched successfully", $expenses);
    }

    public function deleteExpense($token, $id)
    {
        $userId = $this->getUserIdByToken($token);
        $expense = $this->db
            ->query("SELECT id FROM expenses WHERE id = :id AND user_id = :user_id")
            ->get([
                ":id" => $id,
                ":user_id" => $userId
            ]);

        if (!$expense) {
            return sendResponse(false, "Expense not found");
        }

        $this->db
            ->query("UPDATE expenses SET status=false WHERE id = :id")
            ->execute([
                ":id" => $id
            ]);
        return sendResponse(true, "Expense deleted successfully");
    }

    public function getMonthlySummary($token, $month)
    {
        $userId = $this->getUserIdByToken($token);

        if ($month == "0") {

            $incomeQuery = "SELECT COALESCE(SUM(amount),0) AS total_income FROM income WHERE user_id = :user_id AND status = true";

            $incomeParams = [
                ":user_id" => $userId
            ];
        } else {

            $incomeQuery = "SELECT COALESCE(SUM(amount),0) AS total_income FROM income WHERE user_id = :user_id AND TO_CHAR(income_date, 'YYYY-MM') = :month AND status = true";

            $incomeParams = [
                ":user_id" => $userId,
                ":month" => $month
            ];
        }

        $income = $this->db
            ->query($incomeQuery)
            ->get($incomeParams);

        if ($month == "0") {

            $expensesQuery = "SELECT COALESCE(SUM(amount_spent),0) AS total_expenses FROM expenses WHERE user_id = :user_id AND status = true";

            $expensesParams = [
                ":user_id" => $userId
            ];
        } else {

            $expensesQuery = "SELECT COALESCE(SUM(amount_spent),0) AS total_expenses FROM expenses WHERE user_id = :user_id AND TO_CHAR(spent_date, 'YYYY-MM') = :month AND status = true";

            $expensesParams = [
                ":user_id" => $userId,
                ":month" => $month
            ];
        }

        $expenses = $this->db
            ->query($expensesQuery)
            ->get($expensesParams);

        $totalIncome = $income['total_income'];

        $totalExpenses = $expenses['total_expenses'];

        $savings = $totalIncome - $totalExpenses;

        return sendResponse(
            true,
            "Monthly summary fetched",
            [
                "income" => $totalIncome,
                "expenses" => $totalExpenses,
                "savings" => $savings
            ]
        );
    }
}
