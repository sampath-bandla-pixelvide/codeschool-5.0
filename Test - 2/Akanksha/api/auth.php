<?php

session_start();

if (!isset($_SESSION['user'])) {
  header("Location: index.html");
  exit;
}

echo "<pre>";

print_r($_SESSION);

echo "</pre>";
