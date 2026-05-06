<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/controllers/CourseController.php';

$user = authenticate();
$controller = new CourseController();
$controller->getCourseRatings($user);
