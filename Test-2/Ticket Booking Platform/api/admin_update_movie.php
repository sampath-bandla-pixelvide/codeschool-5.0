<?php
require_once __DIR__ . "/controllers/movieControllers.php";
require_once __DIR__ . "/controllers/bookingControllers.php";
require_once __DIR__ . "/utils/functions.php";

$token = $_POST['token'] ?? '';
if (!$token) {
    sendResponse(false, "Unauthorized");
}
$ctrl = new BookingController();
$role = $ctrl->getUserRoleFromToken($token);
if ($role !== 'admin') {
    sendResponse(false, "Admin access required");
}

$id          = (int)($_POST['id']          ?? 0);
$title       = trim($_POST['title']        ?? '');
$description = trim($_POST['description']  ?? '');
$duration    = (int)($_POST['duration']    ?? 0);
$posterUrl   = trim($_POST['poster_url']   ?? '');
$language    = trim($_POST['language']     ?? 'English');
$releaseDate = trim($_POST['release_date'] ?? '');
$rating      = (float)($_POST['rating']    ?? 0);
$genreId     = (int)($_POST['genre_id']    ?? 0);

if (!$id || !$title || !$duration || !$genreId) {
    sendResponse(false, "id, title, duration and genre_id are required");
}

$movieCtrl = new MovieController();
$success = $movieCtrl->updateMovie($id, $title, $description, $duration, $posterUrl, $language, $releaseDate, $rating, $genreId);

if (!$success) {
    sendResponse(false, "Failed to update movie details or no changes made.");
}

// Handle carousel images if uploaded
if (isset($_FILES['carousel_images']) && !empty($_FILES['carousel_images']['name'][0])) {
    // Delete old carousel images from DB (keep them in folder for simplicity/speed)
    $movieCtrl->deleteCarouselImagesForMovie($id);
    
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
            $newName = 'movie_' . $id . '_' . time() . '_' . $i . '.' . $ext;
            $destPath = $uploadDir . $newName;
            
            if (move_uploaded_file($tmpName, $destPath)) {
                $imageUrl = './assets/movies/' . $newName;
                $movieCtrl->addCarouselImage($id, $imageUrl);
            }
        }
    }
}

sendResponse(true, "Movie updated successfully");
