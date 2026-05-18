<?php

require_once __DIR__ . "/../Utils/db.php";
require_once __DIR__ . "/../Utils/functions.php";

class UserController
{

    private $db = null;

    function __construct()
    {

        $this->db = new DB();
    }

    public function bookAppointment(
        $token,
        $full_name,
        $mobile_number,
        $purpose
    ) {

        $user = $this->db->query(

            "SELECT user_id
         FROM user_tokens
         WHERE token = :token
         AND status = true
         AND expires_at > CURRENT_TIMESTAMP"

        )->get([

            ":token" => $token

        ]);

        if (!$user) {

            return sendResponse(
                false,
                "Invalid token!"
            );
        }

        $appointment = $this->db->query(

            "INSERT INTO appointments
        (
            user_id,
            full_name,
            mobile_number,
            purpose,
            status
        )
        VALUES
        (
            :user_id,
            :full_name,
            :mobile_number,
            :purpose,
            :status
        )
        RETURNING id"

        )->get([

            ":user_id" => $user["user_id"],

            ":full_name" => $full_name,

            ":mobile_number" => $mobile_number,

            ":purpose" => $purpose,

            ":status" => "Waiting"

        ]);

        return json_encode([

            "status" => true,

            "message" =>
            "Appointment booked successfully!",

            "token_number" =>
            $appointment["id"]

        ]);
    }
    public function getWaitingCount()
    {

        $waitingCount = $this->db->query(

            "SELECT COUNT(*) AS waiting_count
         FROM appointments
         WHERE status = 'Waiting'"

        )->get();

        return sendResponse(
            true,
            "Waiting count fetched!",
            $waitingCount
        );
    }
    public function getAppointments(
        $page = 1
    ) {

        $limit = 5;

        $page = (int)$page;

        if ($page < 1) {

            $page = 1;
        }

        $offset =
            ($page - 1) * $limit;

        $appointments = $this->db->query(

            "SELECT *
         FROM appointments
         ORDER BY id DESC
         LIMIT $limit
         OFFSET $offset"

        )->getAll();

        $totalCount = $this->db->query(

            "SELECT COUNT(*) AS total
         FROM appointments"

        )->get();

        return json_encode([

            "status" => true,

            "message" =>
            "Appointments fetched!",

            "data" => $appointments,

            "total_count" =>
            (int)$totalCount["total"]

        ]);
    }
    public function updateProfile(
    $token,
    $full_name,
    $email,
    $phone_number
)
{

    $user =
        $this->db->query(

            "SELECT user_id
             FROM user_tokens
             WHERE token = :token
             AND status = true"

        )->get([

            ":token" => $token

        ]);

    if (!$user) {

        return sendResponse(
            false,
            "Invalid token!"
        );

    }

    $this->db->query(

        "UPDATE users
         SET

         first_name = :first_name,

         email = :email,

         phone_number = :phone_number,

         updated_at = CURRENT_TIMESTAMP

         WHERE id = :id"

    )->execute([

        ":first_name" =>
            $full_name,

        ":email" =>
            $email,

        ":phone_number" =>
            $phone_number,

        ":id" =>
            $user["user_id"]

    ]);

    return sendResponse(
        true,
        "Profile updated successfully!"
    );

}
}
