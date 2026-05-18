<?php

require_once __DIR__ . "/../Utils/db.php";
require_once __DIR__ . "/../Utils/functions.php";

class AdminController
{

    private $db = null;

    function __construct()
    {

        $this->db = new DB();

    }

    public function getAppointments(
        $page = 1
    )
    {

        $limit = 5;

        $page = (int)$page;

        if ($page < 1) {

            $page = 1;

        }

        $offset =
            ($page - 1) * $limit;

        $appointments =
            $this->db->query(

                "SELECT *
                 FROM appointments
                 ORDER BY id DESC
                 LIMIT $limit
                 OFFSET $offset"

            )->getAll();

        $totalCount =
            $this->db->query(

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

    public function getQueueStatus()
    {

        $waiting =
            $this->db->query(

                "SELECT COUNT(*) AS count
                 FROM appointments
                 WHERE status = 'Waiting'"

            )->get();

        $called =
            $this->db->query(

                "SELECT COUNT(*) AS count
                 FROM appointments
                 WHERE status = 'Called'"

            )->get();

        $completed =
            $this->db->query(

                "SELECT COUNT(*) AS count
                 FROM appointments
                 WHERE status = 'Completed'"

            )->get();

        $cancelled =
            $this->db->query(

                "SELECT COUNT(*) AS count
                 FROM appointments
                 WHERE status = 'Cancelled'"

            )->get();

        return json_encode([

            "status" => true,

            "data" => [

                "waiting" =>
                    (int)$waiting["count"],

                "called" =>
                    (int)$called["count"],

                "completed" =>
                    (int)$completed["count"],

                "cancelled" =>
                    (int)$cancelled["count"]

            ]

        ]);

    }

    public function updateAppointmentStatus(
        $appointment_id,
        $status
    )
    {

        $this->db->query(

            "UPDATE appointments
             SET status = :status
             WHERE id = :id"

        )->execute([

            ":status" => $status,

            ":id" => $appointment_id

        ]);

        return sendResponse(
            true,
            "Status updated successfully!"
        );

    }
    public function getWaitingAppointments()
{

    $appointments =
        $this->db->query(

            "SELECT *
             FROM appointments
             WHERE status != 'Completed'
             AND status != 'Cancelled'
             ORDER BY id ASC"

        )->getAll();

    return json_encode([

        "status" => true,

        "data" => $appointments

    ]);

}
public function callNextAppointment()
{

    $calledAppointment =
        $this->db->query(

            "SELECT *
             FROM appointments
             WHERE status = 'Called'
             ORDER BY id ASC
             LIMIT 1"

        )->get();

    if ($calledAppointment) {

        $this->db->query(

            "UPDATE appointments
             SET status = 'Completed'
             WHERE id = :id"

        )->execute([

            ":id" =>
                $calledAppointment["id"]

        ]);

    }

    $nextAppointment =
        $this->db->query(

            "SELECT *
             FROM appointments
             WHERE status = 'Waiting'
             ORDER BY id ASC
             LIMIT 1"

        )->get();

    if (!$nextAppointment) {

        return sendResponse(
            false,
            "No more appointments"
        );

    }

    $this->db->query(

        "UPDATE appointments
         SET status = 'Called'
         WHERE id = :id"

    )->execute([

        ":id" =>
            $nextAppointment["id"]

    ]);

    return sendResponse(
        true,
        "Next appointment called!"
    );

}
public function cancelAppointment(
    $appointment_id
)
{

    $appointment =
        $this->db->query(

            "SELECT *
             FROM appointments
             WHERE id = :id"

        )->get([

            ":id" =>
                $appointment_id

        ]);

    if (!$appointment) {

        return sendResponse(
            false,
            "Appointment not found!"
        );

    }

    if (
        $appointment["status"]
        !== "Waiting"
    ) {

        return sendResponse(
            false,
            "Only waiting users can be cancelled!"
        );

    }

    $this->db->query(

        "UPDATE appointments
         SET status = 'Cancelled'
         WHERE id = :id"

    )->execute([

        ":id" =>
            $appointment_id

    ]);

    return sendResponse(
        true,
        "Appointment cancelled!"
    );

}
}