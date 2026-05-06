<?php

require_once(__DIR__ . '/../../helpers/functions.php');
require_once(__DIR__ . '/../../config/db.php');
require_once(__DIR__ . '/../../middleware/auth.php');

$user = verifyToken();