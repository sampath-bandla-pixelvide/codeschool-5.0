<?php
require_once __DIR__ . "/controllers/movieControllers.php";
require_once __DIR__ . "/controllers/bookingControllers.php";
$token = $_POST['token'] ?? '';
if (!$token) {
    require_once __DIR__ . "/utils/functions.php";
    sendResponse(false, "Unauthorized");
}
$ctrl = new BookingController();
$role = $ctrl->getUserRoleFromToken($token);
if ($role !== 'admin') {
    require_once __DIR__ . "/utils/functions.php";
    sendResponse(false, "Admin access required");
}
$title       = trim($_POST['title']        ?? '');
$description = trim($_POST['description']  ?? '');
$duration    = (int)($_POST['duration']    ?? 0);
$posterUrl   = trim($_POST['poster_url']   ?? '');
$language    = trim($_POST['language']     ?? 'English');
$releaseDate = trim($_POST['release_date'] ?? '');
$rating      = (float)($_POST['rating']    ?? 0);
$genreId     = (int)($_POST['genre_id']    ?? 0);
if (!$title || !$duration || !$genreId) {
    require_once __DIR__ . "/utils/functions.php";
    sendResponse(false, "title, duration and genre_id are required");
}
require_once __DIR__ . "/utils/functions.php";

$movieCtrl = new MovieController();
$movieId = $movieCtrl->createMovie($title, $description, $duration, $posterUrl, $language, $releaseDate, $rating, $genreId);

if (!$movieId) {
    sendResponse(false, "Failed to create movie");
}

if (isset($_FILES['carousel_images']) && !empty($_FILES['carousel_images']['name'][0])) {
    $uploadDir = __DIR__ . '/../assets/movies/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $fileCount = count($_FILES['carousel_images']['name']);
    for ($i = 0; $i < $fileCount; $i++) {
        $fileName = $_FILES['carousel_images']['name'][$i];
        $tmpName  = $_FILES['carousel_images']['tmp_name'][$i];
        $error    = $_FILES['carousel_images']['error'][$i];
        
        if ($error === UPLOAD_ERR_OK) {
            $ext = pathinfo($fileName, PATHINFO_EXTENSION);
            $newName = 'movie_' . $movieId . '_' . time() . '_' . $i . '.' . $ext;
            $destPath = $uploadDir . $newName;
            
            if (move_uploaded_file($tmpName, $destPath)) {
                $imageUrl = './assets/movies/' . $newName;
                $movieCtrl->addCarouselImage($movieId, $imageUrl);
            }
        }
    }
}

sendResponse(true, "Movie created successfully", ['id' => $movieId]);
