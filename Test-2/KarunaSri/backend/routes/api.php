<?php

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/AdminController.php';
require_once __DIR__ . '/../controllers/TripController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

$authController = new AuthController();
$adminController = new AdminController();
$tripController = new TripController();

$path = $_GET['path'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

$segments = explode('/', trim($path, '/'));

$resource = $segments[0] ?? null;
$id = $segments[1] ?? null;

// helper for protected routes
function protected_route($callback, $roleCheck = null) {
    $user = AuthMiddleware::handle();
    if ($roleCheck) {
        RoleMiddleware::$roleCheck($user);
    }
    return $callback($user);
}

switch ($resource) {
    // AUTH ROUTES
    case 'auth':
        if ($id === 'login' && $method === 'POST') {
            $authController->login();
        } else {
            ResponseHelper::error("Endpoint not found",404);
        }

    break;

    // ADMIN - EMPLOYEE MANAGEMENT
    case 'employees':
    if (!empty($id) && !is_numeric($id)) {
        ResponseHelper::error("Invalid employee ID", 400);
    }

    if ($method === 'GET' && empty($id)) {
        protected_route(
            [$adminController, 'getEmployees'],
            'isAdmin'
        );

    } elseif ($method === 'POST' && empty($id)) {
        protected_route(
            [$adminController, 'createEmployee'],
            'isAdmin'
        );

    } elseif ($method === 'PUT' && !empty($id)) {
        protected_route(
            function() use ($adminController, $id) {
                $adminController->updateEmployee($id);
            },
            'isAdmin'
        );

    } elseif ($method === 'DELETE' && !empty($id)) {
        protected_route(
            function() use ($adminController, $id) {
                $adminController->deleteEmployee($id);
            },
            'isAdmin'
        );

    } else {
        ResponseHelper::error(
            "Endpoint not found",
            404
        );
    }

    break;

    // ADMIN - EXIT MANAGEMENT
    case 'exits':

        if ($method === 'GET' && empty($id)) {

            $adminController->getExits();

        } elseif ($method === 'POST' && empty($id)) {

            protected_route(
                [$adminController, 'createExit'],
                'isAdmin'
            );

        } elseif ($method === 'PUT' && !empty($id)) {

            protected_route(
                fn() => $adminController->updateExit($id),
                'isAdmin'
            );

        } elseif ($method === 'DELETE' && !empty($id)) {

            protected_route(
                fn() => $adminController->deleteExit($id),
                'isAdmin'
            );

        } else {

            ResponseHelper::error(
                "Endpoint not found",
                404
            );
        }

        break;

    // ADMIN - TOLL RATES
   case 'toll-rates':
    if ($method === 'GET' && empty($id)) {
        protected_route(
            [$adminController, 'getTollRates'],
            'isAdmin'
        );
    } elseif ($method === 'POST' && empty($id)) {
        protected_route(
            [$adminController, 'createTollRate'],
            'isAdmin'
        );
    } elseif ($method === 'PUT' && !empty($id)) {
        protected_route(
            fn() => $adminController->updateTollRate($id),
            'isAdmin'
        );
    } elseif ($method === 'DELETE' && !empty($id)) {
        protected_route(
            fn() => $adminController->deleteTollRate($id),
            'isAdmin'
        );
    } else {
        ResponseHelper::error(
            "Endpoint not found",
            404
        );
    }

    break;

    // TRIP ROUTES
    case 'trips':
        if ($id === 'entry' && $method === 'POST') {
            protected_route(
                [$tripController, 'entry'],
                'isEmployee'
            );
        } elseif ($id === 'exit' && $method === 'POST') {
            protected_route(
                [$tripController, 'exit'],
                'isEmployee'
            );
        } elseif ($id === 'active' && $method === 'GET') {
            protected_route(
                [$tripController, 'getActiveTrips'],
                'isEmployee'
            );
        } elseif (!empty($id) && $method === 'GET') {
            protected_route(
                fn() => $tripController->getTripByToken($id),
                'isEmployee'
            );
        } else {
            ResponseHelper::error("Endpoint not found", 404);
        }
        break;
    
        // REPORT ROUTES
    case 'reports':
        if ($id === 'daily' && $method === 'GET') {
            protected_route(
                [$tripController, 'getDailyReport'],
                'isAdmin'
            );
        } elseif (
            $id === 'employee-collections'
            && $method === 'GET'
        ) {
            protected_route(
                [$tripController, 'getEmployeeCollections'],
                'isAdmin'
            );
        } else {
            ResponseHelper::error("Endpoint not found", 404);
        }
    break;

    default:
        ResponseHelper::error("Endpoint not found", 404);
        break;
}
